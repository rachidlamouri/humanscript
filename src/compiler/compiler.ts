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
import { HumanscriptCommentNode } from './nodes/statements/humanScriptCommentNode';
import { SubtractionExpressionNode } from './nodes/expressions/subtractionExpressionNode';
import { BlockNode } from './nodes/statements/blockNode';
import { AssemblyCommentReferenceNode } from './nodes/statements/assembly-comments/assemblyCommentStatementNode';
import { AssemblyCommentDefinitionNode } from './nodes/statements/assembly-comments/assemblyCommentDefinitionNode';
import { Node } from './nodes/node';
import { EqualsConditionNode } from './nodes/conditions/equalsConditionNode';
import { NotEqualsConditionNode } from './nodes/conditions/notEqualsConditionNode';
import { Condition } from './nodes/conditions/condition';
import {
  BinaryComparisonConstructor,
  Comparable,
} from './nodes/conditions/comparable';
import { ZeroLiteralNode } from './nodes/zeroLiteralNode';
import { TrueConditionNode } from './nodes/conditions/trueConditionNode';
import { GreaterThanConditionNode } from './nodes/conditions/greaterThanConditionNode';
import { LessThanConditionNode } from './nodes/conditions/lessThanConditionNode.ts';
import { NegationExpressionNode } from './nodes/expressions/negationExpressionNode';
import { BinaryMathExpressionNode } from './nodes/expressions/binaryMathExpressionNode';
import { GreaterThanOrEqualToConditionNode } from './nodes/conditions/greaterThanOrEqualToConditionNode';
import { LessThanOrEqualToConditionNode } from './nodes/conditions/lessThanOrEqualToConditionNode';
import { IncremenetAssignmentStatementNode } from './nodes/statements/incrementAssignmentStatementNode';
import { DecrementAssignmentStatementNode } from './nodes/statements/decrementAssignmentStatementNode';

type NestedStatementNodeList = [Statement, unknown];

type Language = {
  program: BlockNode;

  floorInit: FloorInitNode;

  statementList: Statement[];
  recursiveStatementList: NestedStatementNodeList;

  statement: Statement;
  assemblyComment: AssemblyCommentReferenceNode;
  humanscriptComment: HumanscriptCommentNode;
  letStatement: LetStatementNode;
  whileStatement: WhileStatementNode;
  ifStatement: IfStatementNode;
  optionalElseStatement: BlockNode | null;
  elseStatement: BlockNode;
  assignmentStatement: AssignmentStatementNode;
  incrementAssignmentStatement: IncremenetAssignmentStatementNode;
  decrementAssignmentStatement: DecrementAssignmentStatementNode;

  optionalFloorSlot: FloorIndex | null;
  floorSlot: FloorIndex;

  optionalConditionExpression: Condition;
  conditionExpression: Condition;
  condition: Condition;
  block: BlockNode;

  readableExpression: ReadableExpression;
  mathExpression: BinaryMathExpressionNode | NegationExpressionNode;
  binaryMathExpression: BinaryMathExpressionNode;
  negationExpression: NegationExpressionNode;

  readableReference: ReadableReference;
  comparable: Comparable;
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
      l.statementList,
      P.optWhitespace,
    ).map((result) => {
      const initialStatements = result[1];
      const tempBlock = new BlockNode(initialStatements);

      const flattenedAst: Node[] = [];
      tempBlock.flatten(flattenedAst);

      const finalStatements = [...initialStatements];
      flattenedAst
        .filter(
          (node): node is AssemblyCommentReferenceNode =>
            node instanceof AssemblyCommentReferenceNode,
        )
        .forEach((reference) => {
          finalStatements.push(new AssemblyCommentDefinitionNode(reference));
        });

      return new BlockNode(finalStatements);
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
      l.assemblyComment,
      l.humanscriptComment,
      l.letStatement,
      l.whileStatement,
      l.ifStatement,
      l.assignmentStatement,
      l.incrementAssignmentStatement,
      l.decrementAssignmentStatement,
      l.floorInit,
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
      l.optionalConditionExpression,
      P.whitespace,
      l.block,
    ).map((result) => {
      return new WhileStatementNode(result[1], result[3]);
    });
  },
  ifStatement: (l) => {
    return P.seq(
      // -
      P.string('if'),
      P.whitespace,
      l.conditionExpression,
      P.whitespace,
      l.block,
      l.optionalElseStatement,
    ).map((result) => {
      const elseBlock = result[5] ?? new BlockNode([]);
      return new IfStatementNode(result[2], result[4], elseBlock);
    });
  },
  optionalElseStatement: (l) => {
    return P.alt<Language['optionalElseStatement']>(
      // -
      P.seq(
        // -
        P.whitespace,
        l.elseStatement,
      ).map((result) => result[1]),
      ul.ε,
    );
  },
  elseStatement: (l) => {
    return P.seq(
      // -
      P.string('else'),
      P.whitespace,
      l.block,
    ).map((result) => {
      return result[2];
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
  incrementAssignmentStatement: (l) => {
    return P.seq(
      // -
      l.identifier,
      P.whitespace,
      P.string('+='),
      P.whitespace,
      P.string('1'),
    ).map((result) => {
      return new IncremenetAssignmentStatementNode(result[0]);
    });
  },
  decrementAssignmentStatement: (l) => {
    return P.seq(
      // -
      l.identifier,
      P.whitespace,
      P.string('-='),
      P.whitespace,
      P.string('1'),
    ).map((result) => {
      return new DecrementAssignmentStatementNode(result[0]);
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

  optionalConditionExpression: (l) => {
    return P.alt<Language['optionalConditionExpression']>(
      P.seq(
        // -
        P.whitespace,
        l.conditionExpression,
      ).map((result) => result[1]),
      ul.ε.map(() => {
        return new TrueConditionNode();
      }),
    );
  },
  conditionExpression: (l) => {
    return P.seq(
      P.string('('),
      P.optWhitespace,
      l.condition,
      P.optWhitespace,
      P.string(')'),
    ).map((result) => {
      return result[2];
    });
  },
  condition: (l) => {
    return P.seq(
      l.readableReference,
      P.optWhitespace,
      P.alt<BinaryComparisonConstructor>(
        // -
        P.string('==').result(EqualsConditionNode),
        P.string('!=').result(NotEqualsConditionNode),
        P.string('>=').result(GreaterThanOrEqualToConditionNode),
        P.string('>').result(GreaterThanConditionNode),
        P.string('<=').result(LessThanOrEqualToConditionNode),
        P.string('<').result(LessThanConditionNode),
      ),
      P.optWhitespace,
      l.comparable,
    ).map((result) => {
      const left = result[0];
      const Constructor = result[2];
      const right = result[4];

      const condition = new Constructor(left, right);
      return condition;
    });
  },
  block: (l) => {
    return P.seq(
      P.string('{'),
      P.whitespace,
      l.statementList,
      P.whitespace,
      P.string('}'),
    ).map((result) => {
      return new BlockNode(result[2]);
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
    return P.alt<Language['mathExpression']>(
      // -
      l.binaryMathExpression,
      l.negationExpression,
    );
  },
  binaryMathExpression: (l) => {
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
  negationExpression: (l) => {
    return P.seq(
      // -
      P.string('-'),
      P.optWhitespace,
      l.readableReference,
    ).map((result) => {
      return new NegationExpressionNode(result[2]);
    });
  },

  readableReference: (l) => {
    return P.alt<Language['readableReference']>(
      // -
      l.inbox,
      l.identifier,
    );
  },
  comparable: (l) => {
    return P.alt<Comparable>(
      P.string('0').map(() => {
        return new ZeroLiteralNode();
      }),
      l.readableReference,
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

  assemblyComment: () => {
    return P.regex(/##[^\n]*/).map((comment) => {
      const text = comment.slice(2).trim();
      return new AssemblyCommentReferenceNode(text);
    });
  },

  humanscriptComment: () => {
    return P.regex(/#[^\n]*/).map((comment) => {
      const text = comment.slice(1).trim();
      return new HumanscriptCommentNode(text);
    });
  },
});

export const compile = (code: string): string => {
  const block = language.program.tryParse(code);

  const context = new CompilerContext();
  const compiledParts = block.compile(context);

  const result = compiledParts.map((part) => part.serialized).join('\n');

  return result;
};
