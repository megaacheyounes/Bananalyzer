/// <reference types="node" />
import BinaryXmlParser from './binaryxml';
interface Element {
    nodeName: any;
    childNodes: any[];
    attributes: Iterable<any> | ArrayLike<any>;
}
declare class ManifestParser {
    buffer: Buffer;
    xmlParser: BinaryXmlParser;
    constructor(buffer: Buffer, options?: {
        debug: boolean;
    });
    collapseAttributes(element: Element): any;
    parseIntents(element: {
        childNodes: any[];
    }, target: {
        intentFilters: any[];
        metaData: any[];
    }): void;
    parseApplication(element: Element): any;
    isLauncherActivity(activity: {
        intentFilters: any[];
    }): boolean;
    parse(): any;
}
export default ManifestParser;
