import slugify from 'slugify'
export function handleSlug(text: string): string {
  return slugify(text, {
    lower: true,
    locale: "vi",
    strict: true,
    replacement: "-",
    remove: /[*+~.()?=&,$/'"!:@]/g,       // trim leading and trailing replacement chars, defaults to `true`
  })
}

export { slugify }
