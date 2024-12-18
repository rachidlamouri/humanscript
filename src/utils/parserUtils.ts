import P from 'parsimmon';
import { debug } from '../utils/debug';
import { assertHasExactlyZeroOrOne } from './assertHasZeroOrOne';

type ParserResultType<TParser extends P.Parser<unknown>> =
  TParser extends P.Parser<infer TResult> ? TResult : never;

class ParserDebugger {
  indent = 0;

  incrementIndent() {
    this.indent += 1;
  }

  decrementIndent() {
    this.indent -= 1;
  }

  resetIndent() {
    this.indent = 0;
  }

  indentDebug(...args: Parameters<typeof console.log>): void {
    const indent = this.indent;
    debug(indent.toString().padStart(2, ' '), ' |'.repeat(indent), ...args);

    if (indent > 100) {
      throw Error('Possible infinite recursion detected');
    }
  }

  /**
   * Adds debug logs to a parser. Logs the following:
   *   - 'T' when a parser is tried
   *   - '_' when a parser finishes but has no data
   *   - 'M' when a parser finishes and has a match
   *   - '--' when a parser finishes and fails to match
   */
  withIndentDebug<TResult>(parserName: string, parser: P.Parser<TResult>) {
    return P.alt<ParserResultType<typeof parser>>(
      ParserDebugger.tap((...idk) => {
        this.incrementIndent();
        this.indentDebug('T', parserName, idk);
      }),
      parser.map((result) => {
        const letter = result === null ? '_' : 'M';
        this.indentDebug(
          letter,
          parserName,
          '"' + JSON.stringify(result) + '"',
        );
        this.decrementIndent();
        return result;
      }),
      ParserDebugger.tap(() => {
        this.indentDebug('--');
        this.decrementIndent();
      }),
    );
  }

  /**
   * Creates a parser that always fails, but calls the given function. Use this in
   * P.alt to log information between alternate parsers
   */
  static tap = (fn: (...args: string[]) => void): P.Parser<never> => {
    return P((input, i) => {
      fn(input.charAt(i));
      return P.makeFailure(i, '');
    }) as P.Parser<never>;
  };
}

export const parserDebugger = new ParserDebugger();

type GenericLanguageSpec = Record<string, unknown>;

type GenericLanguageParserBuilder = (
  language: P.TypedLanguage<unknown>,
) => P.Parser<unknown>;

export const createLanguage = <TLanguageSpec extends GenericLanguageSpec>(
  parserDebugger: ParserDebugger,
  languageRules: P.TypedRule<TLanguageSpec>,
): P.TypedLanguage<TLanguageSpec> => {
  const ruleEntries = Object.entries(languageRules) as [
    string,
    GenericLanguageParserBuilder,
  ][];

  const modifiedRuleEntries = ruleEntries.map(([parserName, parserBuilder]) => {
    const modifiedParserBuilder: GenericLanguageParserBuilder = (l) => {
      const parser = parserBuilder(l);
      const parserWithDebug = parserDebugger.withIndentDebug(
        parserName,
        parser,
      );
      return parserWithDebug;
    };
    return [parserName, modifiedParserBuilder] as const;
  });

  const rulesWithDebug = Object.fromEntries(
    modifiedRuleEntries,
  ) as P.TypedRule<TLanguageSpec>;

  const language = P.createLanguage<TLanguageSpec>(rulesWithDebug);
  return language;
};

const KEBAB = /[0-9a-zA-Z?]+(-[0-9a-zA-Z?]+)*/;

type UtilLanguage = {
  kebab: string;
  ε: null;
};

const utilLanguage = {
  ...createLanguage<UtilLanguage>(parserDebugger, {
    kebab: () => {
      return P.regex(KEBAB);
    },
    ε: () => {
      return P.string('').result(null);
    },
  }),
  /** Optional: Makes a parser optional */
  opt: <TParser extends P.Parser<unknown>>(
    parser: TParser,
  ): P.Parser<ParserResultType<TParser> | null> => {
    type ResultType = ParserResultType<typeof parser>;

    return (parser as P.Parser<ResultType>).times(0, 1).map((result) => {
      assertHasExactlyZeroOrOne(result);

      const value: ResultType | null = result[0] ?? null;
      return value;
    });
  },
  /** Spaced Optional: Creates an optional parser for whitespace followed by the original parser result */
  sopt: <TParser extends P.Parser<unknown>>(
    parser: TParser,
  ): P.Parser<ParserResultType<TParser> | null> => {
    type ResultType = ParserResultType<typeof parser>;

    return utilLanguage
      .opt(P.seq(P.whitespace, parser as P.Parser<ResultType>))
      .map((result) => {
        const value = result?.[1] ?? null;
        return value;
      });
  },
};

export const ul = utilLanguage;
