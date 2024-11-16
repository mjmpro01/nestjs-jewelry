import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import moment from 'moment';
import * as querystring from 'qs';
import { Repository } from 'typeorm';

import { Order, OrderStatus } from '../order/entities/order.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @Inject(REQUEST) private readonly request: Request
  ) {}
  getClientIp(): string {
    const req = this.request;
    console.log('req', req);
    // return (
    //   (typeof req.headers['x-forwarded-for'] === 'string' && req.headers['x-forwarded-for'].split(',').shift()) ||
    //   req.ip ||
    //   req.connection?.remoteAddress ||
    //   req.socket?.remoteAddress ||
    //   req.connection?.socket?.remoteAddress ||
    //   ''
    // );
    return 'hello';
  }
  async createPaymentUrl(
    orderCode: string,
  ): Promise<{ url: string }> {
    try {
      process.env.TZ = 'Asia/Ho_Chi_Minh';
      const date = new Date();
      const createDate = moment(date).format('YYYYMMDDHHmmss');

      const tmnCode = this.configService.get<string>('vnp_TmnCode');
      const secretKey = this.configService.get<string>('vnp_HashSecret') || '';
      const vnpUrl = this.configService.get<string>('vnp_Url');
      const returnUrl = this.configService.get<string>('vnp_ReturnUrl');

      const order = await this.orderRepository.findOne({
        where: { orderCode: orderCode },
      });
      if (!order) {
        throw new Error(`Order code is not valid with id: ${orderCode}`);
      }
      const ipAddr = this.getClientIp();
      this.logger.log(`Start create VNPAY url with order code: ${orderCode}`);
      // let ipAddr: any = =
      //     req?.headers["x-forwarded-for"] ||
      //     req?.connection?.remoteAddress ||
      //     req?.socket?.remoteAddress ||
      //     req?.connection?.socket?.remoteAddress;
        const vnp_Params: any = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn', 
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderCode,
        vnp_OrderInfo: `Thanh toan cho ma don hang: ${orderCode}`,
        vnp_OrderType: 'other',
        vnp_Amount: order.totalAmount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      // if (bankCode) {
      //   vnp_Params['vnp_BankCode'] = bankCode;
      // }

      const sortedParams = this.sortObject(vnp_Params);
      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      vnp_Params['vnp_SecureHash'] = signed;

      const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;

      return { url: paymentUrl };
    } catch (e) {
      this.logger.error(`Error creating payment URL: ${e}`);
      throw e;
    }
  }

  async vnpayReturn(vnp_Params: any): Promise<{ redirectUrl: string }> {
    try {
      const rspCode = vnp_Params['vnp_ResponseCode'];
      const secureHash = vnp_Params['vnp_SecureHash'];

      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];

      const sortedParams = this.sortObject(vnp_Params);
      const secretKey = this.configService.get<string>('vnp_HashSecret') || '';
      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac('sha512', secretKey);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

      const order = await this.orderRepository.findOne({
        where: { orderCode: vnp_Params?.vnp_TxnRef },
      });

      if (secureHash === signed) {
        if (
          order &&
          Number(order.totalAmount) === Number(vnp_Params?.vnp_Amount) / 100 &&
          rspCode === '00'
        ) {
          this.logger.log(
            `VNPAY return status with order_code ${order.orderCode}: SUCCESS`,
          );
          return {
            redirectUrl: `${this.configService.get<string>('success_page')}/${order.id}?status_code=${vnp_Params?.vnp_TransactionStatus}`,
          };
        } else {
          this.logger.log(
            `VNPAY return status with order_code ${order?.id}: FAIL(${vnp_Params?.vnp_TransactionStatus})`,
          );
          if (order) {
            await this.orderRepository.update(order.id, { status: OrderStatus.CANCELLED });
          }
          return {
            redirectUrl: `${this.configService.get<string>('fail_page')}/${order?.id}?status_code=${vnp_Params?.vnp_TransactionStatus}`,
          };
        }
      } else {
        this.logger.log(
          `VNPAY return status: FAIL(${vnp_Params?.vnp_TransactionStatus})`,
        );
        if (order) {
          await this.orderRepository.update(order.id, { status: OrderStatus.CANCELLED });
        }
        return {
          redirectUrl: `${this.configService.get<string>('fail_page')}/${order?.id}?status_code=${vnp_Params?.vnp_TransactionStatus}`,
        };
      }
    } catch (e) {
      this.logger.error(`Error processing VNPAY return: ${e}`);
      throw e;
    }
  }

  private sortObject(obj: any): any {
    const sorted: any = {};
    const str: string[] = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
