import P from 'parsimmon';
import { AssignmentStatementNode } from './nodes/assignmentNode';
import { createLanguage, parserDebugger } from '../utils/parserUtils';
import {
  Identifier,
  Inbox,
  INBOX_CODE,
  Outbox,
  OUTBOX_CODE,
} from './types/primitiveTypes';
import { CompilerContext, Node } from './nodes/node';
import { assertIsArray } from '../utils/assertIsArray';
import { StatementNode } from './nodes/statementNode';
import { WhileLoopNode } from './nodes/whileLoopNode';
import { FloorSlot } from './types/floorSlot';
import { ReadableReference, WriteableReference } from './types/compoundTypes';
import { LetStatementNode } from './nodes/letStatementNode';

type NestedStatementNodeList = [StatementNode, unknown];

type Language = {
  program: StatementNode[];
  statementList: StatementNode[];
  recursiveStatementList: NestedStatementNodeList;
  statement: StatementNode;
  block: StatementNode[];
  while: WhileLoopNode;
  condition: unknown;
  letStatement: LetStatementNode;
  assignmentStatement: AssignmentStatementNode;
  readable: ReadableReference;
  writeable: WriteableReference;
  inbox: typeof Inbox;
  outbox: typeof Outbox;
  floorSlot: FloorSlot;
  identifier: Identifier;
  positiveInteger: number;
};

function assertIsStatementNode(value: unknown): asserts value is StatementNode {
  if (value instanceof StatementNode) {
    return;
  }

  throw new Error('Expected a StatementNode');
}

const language = createLanguage<Language>(parserDebugger, {
  program: (l) => {
    return P.seq(
      // -
      P.optWhitespace,
      l.statementList,
      P.optWhitespace,
    ).map((result) => {
      const statementList = result[1];
      return statementList;
    });
  },
  statementList: (l) => {
    return l.recursiveStatementList.map((result) => {
      const statementList: Node[] = [];
      let nextResult: unknown = result;

      do {
        assertIsArray(nextResult);

        const [statement] = nextResult;
        assertIsStatementNode(statement);

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
      l.while,
      l.assignmentStatement,
    );
  },
  while: (l) => {
    return P.seq(
      // -
      P.string('while'),
      P.whitespace,
      l.condition,
      P.whitespace,
      l.block,
    ).map((result) => {
      return new WhileLoopNode(result[4]);
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
  letStatement: (l) => {
    return P.seq(
      // -
      P.string('let'),
      P.whitespace,
      l.identifier,
    ).map((result) => {
      return new LetStatementNode(result[2]);
    });
  },
  assignmentStatement: (l) => {
    return P.seq(
      // -
      l.writeable,
      P.whitespace,
      P.string('='),
      P.whitespace,
      l.readable,
    ).map((result) => {
      const writeable = result[0];
      const readable = result[4];
      return new AssignmentStatementNode(writeable, readable);
    });
  },
  readable: (l) => {
    return P.alt<Language['readable']>(
      // -
      l.inbox,
      l.floorSlot,
      l.identifier,
    );
  },
  writeable: (l) => {
    return P.alt<Language['writeable']>(
      // -
      l.outbox,
      l.identifier,
    );
  },
  inbox: () => {
    return P.string(INBOX_CODE).result(Inbox);
  },
  outbox: () => {
    return P.string(OUTBOX_CODE).result(Outbox);
  },
  floorSlot: (l) => {
    return P.seq(
      //-
      P.string('floor'),
      P.string('['),
      l.positiveInteger,
      P.string(']'),
    ).map((result) => {
      return new FloorSlot(result[2]);
    });
  },
  identifier: () => {
    return P.regex(/[a-zA-z]+/);
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
  const result = root.flatMap((node) => node.compile(context)).join('\n');

  return result;
};
