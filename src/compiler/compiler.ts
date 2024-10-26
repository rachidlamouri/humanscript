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
import { IfStatementNode } from './nodes/statements/ifStatementNode';
import { CommentNode } from './nodes/statements/commentNode';
import { SubtractionExpressionNode } from './nodes/expressions/subtractionExpressionNode';

type NestedStatementNodeList = [Statement, unknown];

type Language = {
  program: Statement[];

  floorInit: FloorInitNode;

  statementList: Statement[];
  recursiveStatementList: NestedStatementNodeList;

  statement: Statement;
  comment: CommentNode;
  letStatement: LetStatementNode;
  whileStatement: WhileStatementNode;
  ifStatement: IfStatementNode;
  assignmentStatement: AssignmentStatementNode;

  optionalFloorSlot: FloorIndex | null;
  floorSlot: FloorIndex;

  whileCondition: null;
  ifConditionExpression: {
    reference: ReadableReference;
    isEqualToZero: boolean;
  };
  ifCondition: { reference: ReadableReference; isEqualToZero: boolean };
  block: Statement[];

  readableExpression: ReadableExpression;
  mathExpression: AdditionExpressionNode | SubtractionExpressionNode;

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
      l.comment,
      l.letStatement,
      l.whileStatement,
      l.ifStatement,
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
      l.whileCondition,
      P.whitespace,
      l.block,
    ).map((result) => {
      return new WhileStatementNode(result[4]);
    });
  },
  ifStatement: (l) => {
    return P.seq(
      // -
      P.string('if'),
      P.optWhitespace,
      l.ifConditionExpression,
      P.optWhitespace,
      l.block,
    ).map((result) => {
      const { isEqualToZero, reference } = result[2];
      return new IfStatementNode(isEqualToZero, reference, result[4]);
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

  ifConditionExpression: (l) => {
    return P.seq(
      P.string('('),
      P.optWhitespace,
      l.ifCondition,
      P.optWhitespace,
      P.string(')'),
    ).map((result) => {
      return result[2];
    });
  },
  ifCondition: (l) => {
    return P.seq(
      l.readableReference,
      P.optWhitespace,
      P.alt<boolean>(
        // -
        P.string('==').result(true),
        P.string('!=').result(false),
      ),
      P.optWhitespace,
      P.string('0'),
    ).map((result) => {
      return {
        reference: result[0],
        isEqualToZero: result[2],
      };
    });
  },
  whileCondition: () => {
    return P.string('true').result(null);
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
      l.mathExpression,
      l.readableReference,
    );
  },
  mathExpression: (l) => {
    return P.seq(
      // -
      l.readableReference,
      P.optWhitespace,
      P.alt<boolean>(
        // -
        P.string('+').result(true),
        P.string('-').result(false),
      ),
      P.optWhitespace,
      l.readableReference,
    ).map((result) => {
      const isAddition = result[2];
      const left = result[0];
      const right = result[4];

      if (isAddition) {
        return new AdditionExpressionNode(left, right);
      } else {
        return new SubtractionExpressionNode(left, right);
      }
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

  comment: () => {
    return P.regex(/#[^\n]*/).map((comment) => {
      const text = comment.slice(1).trim();
      return new CommentNode(text);
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
