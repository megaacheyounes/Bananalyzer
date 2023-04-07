interface Node {
    namespaceURI: any;
    nodeType: any;
    nodeName: string;
    attributes: [];
    childNodes: [];
}
declare class BinaryXmlParser {
    buffer: any;
    cursor: number;
    strings: string[];
    resources: string[];
    document: any;
    parent: any;
    stack: Node[];
    debug: any;
    constructor(buffer: any, options?: {
        debug: boolean;
    });
    readU8(): any;
    readU16(): any;
    readS32(): any;
    readU32(): any;
    readLength8(): any;
    readLength16(): any;
    readDimension(): any;
    readFraction(): any;
    readHex24(): string;
    readHex32(): any;
    readTypedValue(): any;
    convertIntToFloat(int: number): number;
    readString(encoding: string): string;
    readChunkHeader(): {
        startOffset: number;
        chunkType: any;
        headerSize: any;
        chunkSize: any;
    };
    readStringPool(header: {
        startOffset: any;
        chunkType: any;
        headerSize?: any;
        chunkSize: any;
        stringCount?: any;
        styleCount?: any;
        flags?: any;
        stringsStart?: any;
        stylesStart?: any;
    }): null;
    readResourceMap(header: {
        startOffset?: any;
        chunkType?: any;
        headerSize: any;
        chunkSize: any;
    }): null;
    readXmlNamespaceStart(): null;
    readXmlNamespaceEnd(): null;
    readXmlElementStart(): any;
    readXmlAttribute(): any;
    readXmlElementEnd(): null;
    readXmlCData(): any;
    readNull(header: {
        startOffset?: any;
        chunkType?: any;
        headerSize: any;
        chunkSize: any;
    }): null;
    parse(): any;
}
export default BinaryXmlParser;
