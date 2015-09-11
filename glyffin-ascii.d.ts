/**
 * Created by wehjin on 5/24/15.
 */
import {Glyff,Void} from "./glyffin";

export declare function asciiByCode(code : number, base? : Glyff<Void>) : Glyff<Void>;
export declare function asciiMultiLine(lines : number, paragraph : string,
                                       base? : Glyff<Void>) : Glyff<Void>;
export declare function asciiEntireWord(word: string, ink?: Glyff<Void>): Glyff<Void>;
export declare function asciiWord(word : string, xWeightPixels : number,
                                  base? : Glyff<Void>) : Glyff<Void>;
export declare function asciiChar(ch: string, base?: Glyff<Void>): Glyff<Void>;
