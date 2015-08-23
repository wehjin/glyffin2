/**
 * Created by wehjin on 5/24/15.
 */
import Glyffin = require("./glyffin");
import Void = Glyffin.Void;
import Glyff = Glyffin.Glyff;
export declare function asciiByCode(code: number, base?: Glyffin.Glyff<Void>): Glyffin.Glyff<Void>;
export declare function asciiMultiLine(lines: number, paragraph: string, base?: Glyffin.Glyff<Void>): Glyffin.Glyff<Void>;
export declare function asciiEntireWord(word: string, ink?: Glyff<Void>): Glyff<Void>;
export declare function asciiWord(word: string, xWeightPixels: number, base?: Glyff<Void>): Glyffin.Glyff<Glyffin.Void>;
export declare function asciiChar(ch: string, base?: Glyff<Void>): Glyff<Void>;
