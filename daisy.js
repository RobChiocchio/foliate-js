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
    NCX: 'application/x-dtbncx+xml',
    XSL: 'application/xslt+xml',
    CSS: 'text/css',
}

const DOCTYPE = 'http://openebook.org/dtds/oeb-1.2/oebpkg12.dtd'

export const isDAISY = async loader => {
    const { entries } = loader
    const entry = entries.find(entry => entry.filename.endsWith('.opf'))
    const text = await loader.loadText((entry ?? entries[0]).filename)
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, MIME.XML)

    console.log(`doctypeObj.name: ${doc.doctype.name}`);
    console.log(`doctypeObj.internalSubset: ${doc.doctype.internalSubset}`);
    console.log(`doctypeObj.publicId: ${doc.doctype.publicId}`);
    console.log(`doctypeObj.systemId: ${doc.doctype.systemId}`);

    return doc.doctype.systemId == DOCTYPE
}

export class DAISY {
    constructor({ loadText, loadBlob, getSize, sha1 }) {
        throw new Error('Not implemented')
    }

    async init() {
        throw new Error('Not implemented')

        // TODO: find opf file
    }
}