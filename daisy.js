const NS = {
    CONTAINER: 'urn:oasis:names:tc:opendocument:xmlns:container',
    XHTML: 'http://www.w3.org/1999/xhtml',
    OPF: 'http://www.idpf.org/2007/opf',
    // EPUB: 'http://www.idpf.org/2007/ops',
    DC: 'http://purl.org/dc/elements/1.1/',
    DCTERMS: 'http://purl.org/dc/terms/',
    ENC: 'http://www.w3.org/2001/04/xmlenc#',
    NCX: 'http://www.daisy.org/z3986/2005/ncx/',
    XLINK: 'http://www.w3.org/1999/xlink',
    SMIL: 'http://www.w3.org/ns/SMIL',
    OEB: 'http://openebook.org/namespaces/oeb-package/1.0/',
    DTBOOK: 'http://www.daisy.org/z3986/2005/dtbook/',
}

const MIME = {
    // XML: 'application/x-dtbook+xml',
    XML: 'application/xml',
    XHTML: 'application/xhtml+xml',
    HTML: 'text/html',
    NCX: 'application/x-dtbncx+xml',
    XSL: 'application/xslt+xml',
    CSS: 'text/css',
}

const DOCTYPE = 'http://openebook.org/dtds/oeb-1.2/oebpkg12.dtd'

// DEBUG: not all DAISY books have this doctype or OPF files at all
export const isDAISY = async (loader, file) => {
    if (file.type === 'application/zip' && file.name.endsWith('.zip')) {
        const { entries } = loader
        const entry = entries.find(entry => entry.filename.endsWith('.opf'))
        if (!entry) return false

        const text = await loader.loadText((entry ?? entries[0]).filename)
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, MIME.XML)

        return doc.doctype.systemId === DOCTYPE
    }

    return false
}

export class DAISY {
    parser = new DOMParser()

    constructor(loader) {
        this.loader = loader
    }

    async init() {
        const { entries } = this.loader
        const entry = entries.find(entry => entry.filename.endsWith('.xml'))
        const text = await this.loader.loadText((entry ?? entries[0]).filename)
        const doc = this.parser.parseFromString(text, MIME.XML)
        const encoding = doc.xmlEncoding
        // `Document.xmlEncoding` is deprecated, and already removed in Firefox
        // so parse the XML declaration manually
            || text.match(/^<\?xml\s+version\s*=\s*["']1.\d+"\s+encoding\s*=\s*["']([A-Za-z0-9._-]*)["']/)?.[1]
        if (encoding && encoding.toLowerCase() !== 'utf-8') {
            const text = new TextDecoder(encoding).decode(buffer)
            doc = this.parser.parseFromString(text, MIME.XML)
        }

        const $ = x => doc.querySelector(x)
        const $$ = x => [...doc.querySelectorAll(x)]

        //return doc

        const book = {}

        book.metadata = {
            title: $('meta[name="dc:Title"]')?.textContent,
            identifier: $('meta[name="dc:Identifier"]')?.textContent,
            language: $('meta[name="dc:Language"]')?.textContent,
            author: $('meta[name="dc:Creator"]')?.textContent,
            publisher: $('meta[name="dc:Publisher"]')?.textContent,
            published: $('meta[name="dc:Date"]')?.textContent,
            description: $('meta[name="dc:Description"]')?.textContent,
        }

        book.getCover = () => null

        // // split sections by pagenum tag
        // const $pagenums = $$('pagenum')
        
        // book.sections = $pagenums.map((page, i) => {
        //     const next = $pagenums[i + 1]

        //     const urls = new Map()

        //     const load = async name => { // TODO: open SMIL file
        //         const text = $('book').innerHTML.slice(page.start, next?.start)
        //         const src = URL.createObjectURL(new Blob([text], { type: MIME.HTML }))
        //         urls.set(name, src)
        //         return src
        //     }

        //     const unload = async name => {
        //         URL.revokeObjectURL(urls.get(name))
        //     }

        //     const size = () => 1

        //     return {
        //         id: page.id,
        //         label: page.innerHTML.trim(),
        //         load: load,
        //         unload: unload,
        //         size: size,
        //     }
        // })

        book.sections = $$('level2').map((page, i) => {
            const urls = new Map()

            const load = async name => { // TODO: open SMIL file
                const text = page.innerHTML
                const src = URL.createObjectURL(new Blob([text], { type: MIME.HTML }))
                urls.set(name, src)
                return src
            }

            const unload = async name => {
                URL.revokeObjectURL(urls.get(name))
            }

            const size = () => 1

            return {
                id: page.id,
                label: page.id,
                load: load,
                unload: unload,
                size: size,
                href: page.id,
            }
        })

        book.toc = book.sections.map(section => ({ label: section.label, href: section.href }))
        // book.rendition = { layout: 'pre-paginated' }
        book.resolveHref = href => ({ index: book.sections.findIndex(s => s.id === href) })
        book.splitTOCHref = href => [href, null]
        //book.getTOCFragment = doc => doc.documentElement

        book.destroy = () => {
            // for (const arr of urls.values())
            //     for (const url of arr) URL.revokeObjectURL(url)
            console.log('destroy')
        }

        return book
    }
}