import P from 'parsimmon';
import { AssignmentStatementNode } from './nodes/statements/assignmentStatementNode';
import { createLanguage, parserDebugger, ul } from '../utils/parserUtils';
import { assertIsArray } from '../utils/assertIsArray';
import { assertIsStatement, Statement } from './nodes/statements/statement';
import { WhileStatementNode } from './nodes/statements/whileStatementNode';
import { LetStatementNode } from './nodes/statements/letStatementNode';
import { AdditionExpressionNode } from './nodes/expressions/additionExpressionNode';
import { ReadableReference } from './nodes/references/readableReference';
import { InboxNode } from './nodes/references/inboxNode';
import { OutboxNode } from './nodes/references/outboxNode';
import { WriteableReference } from './nodes/references/writeableReference';
import { IdentifierNode } from './nodes/references/identifierNode';
import { FloorInitNode } from './nodes/statements/floorInitNode';
import { ReadableExpression } from './nodes/expressions/readableExpression';
import { CompilerContext, FloorIndex } from './compilerContext';

type NestedStatementNodeList = [Statement, unknown];

type Language = {
  program: Statement[];

  floorInit: FloorInitNode;

  statementList: Statement[];
  recursiveStatementList: NestedStatementNodeList;

  statement: Statement;
  letStatement: LetStatementNode;
  whileStatement: WhileStatementNode;
  assignmentStatement: AssignmentStatementNode;

  optionalFloorSlot: FloorIndex | null;
  floorSlot: FloorIndex;

  condition: unknown;
  block: Statement[];

  readableExpression: ReadableExpression;
  additionExpression: AdditionExpressionNode;

  readableReference: ReadableReference;
  writeableReference: WriteableReference;

  inbox: InboxNode;
  outbox: OutboxNode;
  identifier: IdentifierNode;

  positiveInteger: number;
};

const language = createLanguage<Language>(parserDebugger, {
  program: (l) => {
    return P.seq(
      // -
      P.optWhitespace,
      P.alt<Language['program']>(
        P.seq(
          // -
          l.floorInit,
          P.optWhitespace,
          l.statementList,
        ).map((result) => {
          return [result[0], ...result[2]];
        }),
        l.statementList,
      ),
      P.optWhitespace,
    ).map((result) => {
      const statementList = result[1];
      return statementList;
    });
  },

  floorInit: (l) => {
    return P.seq(
      // -
      P.string('floor'),
      P.whitespace,
      P.string('size'),
      P.whitespace,
      l.positiveInteger,
    ).map((result) => {
      return new FloorInitNode(result[4]);
    });
  },
  statementList: (l) => {
    return l.recursiveStatementList.map((result) => {
      const statementList: Statement[] = [];
      let nextResult: unknown = result;

      do {
        assertIsArray(nextResult);

        const [statement] = nextResult;
        assertIsStatement(statement);

        statementList.push(statement);
        nextResult = nextResult[1];
      } while (nextResult !== null);

      return statementList;
    });
  },
  recursiveStatementList: (l) => {
    return P.alt<Language['recursiveStatementList']>(
      // -
      P.seq(
        // -
        l.statement,
        P.whitespace,
        l.recursiveStatementList,
      ).map((result) => {
        const statement = result[0];
        const statementList = result[2];
        return [statement, statementList];
      }),
      l.statement.map((result) => {
        return [result, null];
      }),
    );
  },

  statement: (l) => {
    return P.alt<Language['statement']>(
      // -
      l.letStatement,
      l.whileStatement,
      l.assignmentStatement,
    );
  },
  letStatement: (l) => {
    return P.seq(
      // -
      P.string('let'),
      P.whitespace,
      l.identifier,
      l.optionalFloorSlot,
    ).map((result) => {
      return new LetStatementNode(result[2], result[3]);
    });
  },
  whileStatement: (l) => {
    return P.seq(
      // -
      P.string('while'),
      P.whitespace,
      l.condition,
      P.whitespace,
      l.block,
    ).map((result) => {
      return new WhileStatementNode(result[4]);
    });
  },
  assignmentStatement: (l) => {
    return P.seq(
      // -
      l.writeableReference,
      P.whitespace,
      P.string('='),
      P.whitespace,
      l.readableExpression,
    ).map((result) => {
      const writeable = result[0];
      const readable = result[4];
      return new AssignmentStatementNode(writeable, readable);
    });
  },

  optionalFloorSlot: (l) => {
    return P.alt<Language['optionalFloorSlot']>(
      // -
      P.seq(
        // -
        P.whitespace,
        l.floorSlot,
      ).map((result) => {
        return result[1];
      }),
      ul.ε,
    );
  },
  floorSlot: (l) => {
    return P.seq(
      //-
      P.string('floor'),
      P.string('['),
      l.positiveInteger,
      P.string(']'),
    ).map((result) => {
      return result[2];
    });
  },

  condition: () => {
    return P.string('true');
  },
  block: (l) => {
    return P.seq(
      P.string('{'),
      P.whitespace,
      l.statementList,
      P.whitespace,
      P.string('}'),
    ).map((result) => {
      return result[2];
    });
  },

  readableExpression: (l) => {
    return P.alt<Language['readableExpression']>(
      // -
      l.additionExpression,
      l.readableReference,
    );
  },
  additionExpression: (l) => {
    return P.seq(
      // -
      l.readableReference,
      P.optWhitespace,
      P.string('+'),
      P.optWhitespace,
      l.readableReference,
    ).map((result) => {
      return new AdditionExpressionNode(result[0], result[4]);
    });
  },

  readableReference: (l) => {
    return P.alt<Language['readableReference']>(
      // -
      l.inbox,
      l.identifier,
    );
  },
  writeableReference: (l) => {
    return P.alt<Language['writeableReference']>(
      // -
      l.outbox,
      l.identifier,
    );
  },

  inbox: () => {
    return P.string('inbox').map(() => {
      return new InboxNode();
    });
  },
  outbox: () => {
    return P.string('outbox').map(() => {
      return new OutboxNode();
    });
  },
  identifier: () => {
    return P.regex(/[a-zA-z]+/).map((result) => {
      return new IdentifierNode(result);
    });
  },

  positiveInteger: () => {
    return P.regex(/[1-9][0-9]*|0/).map((result) => {
      const value = Number.parseInt(result, 10);
      return value;
    });
  },
});

export const compile = (code: string): string => {
  const root = language.program.tryParse(code);

  const context = new CompilerContext();
  const result = root
    .flatMap((node) => node.compileStatement(context))
    .join('\n');

  return result;
};
