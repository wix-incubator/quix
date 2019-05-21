import {TType, IParam} from '../param-types';

export interface ITokenizedParam {
  match: string;
  key: string;
  type: TType;
  value: any;
  isAutoParam: boolean;
  isKeyOnlyParam: boolean;
  options: string[];
}

export abstract class ParamSerializer {
  // serialization pipileine
  public abstract untransform(param: ITokenizedParam): ITokenizedParam;
  public abstract detokenize(param: ITokenizedParam, serializationType: 'serialize' | 'value'): any[];
  public abstract unconvert(param: any[], type: TType): string[];
  public abstract stringify(param: any[]): string;

  // parsing pipeline
  public abstract parse(text: string): Iterable<string[]>;
  public abstract convert(param: string[]): any[];
  public abstract tokenize(param: any[]): ITokenizedParam;
  public abstract transform(param: ITokenizedParam): ITokenizedParam;

  /**
 * Generates an embed string
 */
  public abstract embed(text: string, params: IParam[]): string;

  /**
   * Extracts the embed string
   */
  public abstract extract(text: string, options?: {[key: string]: any}): string;

  /**
   * Converts value to js
   */
  public abstract toJs(value: string, type: TType): any;

    /**
   * Converts value to string
   */
  public abstract toString(value: any, type?: TType): any;

  /**
   * Ranges of rows to lock
   */
  public abstract getLockRange(text: string): [number, number][];

  /**
   * Returns a serialized param
   */
  public serialize(param: ITokenizedParam, serializationType: 'serialize' | 'value' = 'serialize'): string {
    return this.stringify(this.unconvert(this.detokenize(this.untransform(param), serializationType), param.type));
  }

  /**
   * Params iterator
   */
  public params(text: string): Iterable<ITokenizedParam> {
    return Array.from(this.parse(text)).map(param => this.transform(this.tokenize(this.convert(param))));
  }

  /**
   * Params iterator
   */
  public removeEmbed(text: string): string {
    return text.replace(this.extract(text), '');
  }
}
