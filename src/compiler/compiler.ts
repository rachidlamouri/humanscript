import P from 'parsimmon';
import {
  AssignmentStatementNode,
  ReadableAssignmentExpressionNode,
} from './nodes/statements/assignmentStatementNode';
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
import { CompilerContext, FloorIndex, FloorRange } from './compilerContext';
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
  LeftComparable,
  RightComparable,
} from './nodes/conditions/comparable';
import { ZeroLiteralNode } from './nodes/zeroLiteralNode';
import { TrueConditionNode } from './nodes/conditions/trueConditionNode';
import { GreaterThanConditionNode } from './nodes/conditions/greaterThanConditionNode';
import { LessThanConditionNode } from './nodes/conditions/lessThanConditionNode.ts';
import { NegationExpressionNode } from './nodes/expressions/negationExpressionNode';
import { AdditiveExpressionNode } from './nodes/expressions/additiveExpressionNode';
import { GreaterThanOrEqualToConditionNode } from './nodes/conditions/greaterThanOrEqualToConditionNode';
import { LessThanOrEqualToConditionNode } from './nodes/conditions/lessThanOrEqualToConditionNode';
import {
  IncrementAssignmentExpressionNode,
  IncrementAssignmentStatementNode,
} from './nodes/statements/incrementAssignmentStatementNode';
import {
  DecrementAssignmentExpressionNode,
  DecrementAssignmentStatementNode,
} from './nodes/statements/decrementAssignmentStatementNode';
import { MultiplicationExpressionNode } from './nodes/expressions/multiplicationExpressionNode';
import { LabelDefinitionNode } from './nodes/statements/labelDefinitionNode';
import { IndirectFloorSlotNode } from './nodes/references/indirectFloorSlotNode';
import { AndConditionNode } from './nodes/conditions/andConditionNode';
import { FlooredDivisionExpressionNode } from './nodes/expressions/flooredDivisionExpressionNode';
import { ModuloExpressionNode } from './nodes/expressions/moduloExpressionNode';
import {
  MultiplicativeExpressionNode,
  MultiplicativeExpressionNodeConstructor,
} from './nodes/expressions/multiplicativeExpressionNode';

type NestedStatementNodeList = [Statement, unknown];

type Language = {
  program: BlockNode;

  floorInit: FloorInitNode;
  floorReservation: FloorRange[];
  floorReservationValue: FloorRange[];
  floorRangeList: FloorRange[];
  floorRange: FloorRange;
  zeroStartFloorRange: FloorRange;

  statementList: Statement[];
  recursiveStatementList: NestedStatementNodeList;

  statement: Statement;
  assemblyComment: AssemblyCommentReferenceNode;
  humanscriptComment: HumanscriptCommentNode;
  letStatement: LetStatementNode;
  whileStatement: WhileStatementNode;
  ifStatement: IfStatementNode;
  elseStatement: BlockNode;
  assignmentStatement: AssignmentStatementNode;
  incrementAssignmentStatement: IncrementAssignmentStatementNode;
  decrementAssignmentStatement: DecrementAssignmentStatementNode;

  labelDefinition: string | null;
  directFloorSlot: FloorIndex;
  indirectFloorSlot: IndirectFloorSlotNode;

  conditionExpression: Condition;
  conditionList: Condition;
  conditionListPrime: Condition | null;
  condition: Condition;
  block: BlockNode;

  readableExpression: ReadableExpression;
  mathExpression:
    | AdditiveExpressionNode
    | MultiplicativeExpressionNode
    | NegationExpressionNode;
  additiveExpression: AdditiveExpressionNode;
  multiplicativeExpression: MultiplicativeExpressionNode;
  negationExpression: NegationExpressionNode;

  leftComparable: LeftComparable;
  rightComparable: RightComparable;

  readableReference: ReadableReference;
  writeableReference: WriteableReference;
  readableAssignmentExpression: ReadableAssignmentExpressionNode;
  incrementAssignmentExpression: IncrementAssignmentExpressionNode;
  decrementAssignmentExpression: DecrementAssignmentExpressionNode;

  inbox: InboxNode;
  outbox: OutboxNode;
  identifier: IdentifierNode;

  word: string;
  positiveInteger: number;
};

const language = createLanguage<Language>(parserDebugger, {
  program: (l) => {
    return P.seq(
      // -
      P.optWhitespace,
      ul.opt(l.statementList),
      P.optWhitespace,
    ).map((result) => {
      const initialStatements = result[1] ?? [];
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
      ul.sopt(l.floorReservation),
    ).map((result) => {
      return new FloorInitNode(result[4], result[5] ?? []);
    });
  },
  floorReservation: (l) => {
    return P.seq(
      // -
      P.string('reserve'),
      P.whitespace,
      l.floorReservationValue,
    ).map((result) => {
      return result[2];
    });
  },
  floorReservationValue: (l) => {
    return P.alt<Language['floorReservationValue']>(
      l.floorRangeList,
      l.zeroStartFloorRange.map((range) => [range]),
    );
  },
  floorRangeList: (l) => {
    return P.alt<Language['floorRangeList']>(
      P.seq(
        l.floorRange,
        P.optWhitespace,
        P.string(','),
        P.optWhitespace,
        l.floorRangeList,
      ).map((result) => {
        return [result[0], ...result[4]];
      }),
      l.floorRange.map((range) => [range]),
    );
  },
  floorRange: (l) => {
    return P.seq(
      l.positiveInteger,
      P.optWhitespace,
      P.string('-'),
      P.optWhitespace,
      l.positiveInteger,
    ).map((result) => {
      return [result[0], result[4]];
    });
  },
  zeroStartFloorRange: (l) => {
    return l.positiveInteger.map((index) => {
      return [0, index - 1];
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
      ul.sopt(l.labelDefinition),
      ul.sopt(l.directFloorSlot),
    ).map((result) => {
      return new LetStatementNode(result[2], result[3], result[4]);
    });
  },
  whileStatement: (l) => {
    return P.seq(
      // -
      P.string('while'),
      ul.sopt(l.conditionExpression),
      P.whitespace,
      l.block,
    ).map((result) => {
      const condition = result[1] ?? new TrueConditionNode();
      return new WhileStatementNode(condition, result[3]);
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
      ul.sopt(l.elseStatement),
    ).map((result) => {
      const elseBlock = result[5] ?? new BlockNode([]);
      return new IfStatementNode(result[2], result[4], elseBlock);
    });
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
    return l.incrementAssignmentExpression;
  },
  decrementAssignmentStatement: (l) => {
    return l.decrementAssignmentExpression;
  },

  labelDefinition: (l) => {
    return P.seq(
      // -
      P.string('labeled'),
      P.whitespace,
      l.identifier,
    ).map((result) => {
      return result[2].name;
    });
  },
  directFloorSlot: (l) => {
    return P.seq(
      //-
      P.string('at'),
      P.whitespace,
      P.string('floor'),
      P.string('['),
      l.positiveInteger,
      P.string(']'),
    ).map((result) => {
      return result[4];
    });
  },
  indirectFloorSlot: (l) => {
    return P.seq(
      //-
      P.string('floor'),
      P.string('['),
      l.identifier,
      P.string(']'),
    ).map((result) => {
      return new IndirectFloorSlotNode(result[2]);
    });
  },

  conditionExpression: (l) => {
    return P.seq(
      P.string('('),
      P.optWhitespace,
      l.conditionList,
      P.optWhitespace,
      P.string(')'),
    ).map((result) => {
      return result[2];
    });
  },
  conditionList: (l) => {
    return P.seq(
      //-
      l.condition,
      l.conditionListPrime,
    ).map((result) => {
      const left = result[0];
      const right = result[1];

      if (right === null) {
        return left;
      }

      return new AndConditionNode(left, right);
    });
  },
  conditionListPrime: (l) => {
    return ul
      .sopt(
        P.seq(
          // -
          P.string('&&'),
          P.whitespace,
          l.condition,
          l.conditionListPrime,
        ),
      )
      .map((result) => {
        if (result === null) {
          return null;
        }

        const left = result[2];
        const right = result[3];

        if (right === null) {
          return left;
        }

        return new AndConditionNode(left, right);
      });
  },
  condition: (l) => {
    return P.seq(
      l.leftComparable,
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
      l.rightComparable,
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
      P.optWhitespace,
      ul.opt(l.statementList),
      P.optWhitespace,
      P.string('}'),
    ).map((result) => {
      return new BlockNode(result[2] ?? []);
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
      l.additiveExpression,
      l.multiplicativeExpression,
      l.negationExpression,
    );
  },
  additiveExpression: (l) => {
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
  multiplicativeExpression: (l) => {
    return P.seq(
      // -
      l.identifier,
      P.optWhitespace,
      P.alt<MultiplicativeExpressionNodeConstructor>(
        P.string('*').result(MultiplicationExpressionNode),
        P.string('~/').result(FlooredDivisionExpressionNode),
        P.string('%').result(ModuloExpressionNode),
      ),
      P.optWhitespace,
      l.identifier,
    ).map((result) => {
      const Constructor = result[2];
      return new Constructor(result[0], result[4]);
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

  leftComparable: (l) => {
    return P.alt<LeftComparable>(
      l.incrementAssignmentExpression,
      l.decrementAssignmentExpression,
      l.readableAssignmentExpression,
      l.readableReference,
    );
  },
  rightComparable: (l) => {
    return P.alt<RightComparable>(
      P.string('0').map(() => {
        return new ZeroLiteralNode();
      }),
      l.readableReference,
    );
  },

  readableReference: (l) => {
    return P.alt<Language['readableReference']>(
      // -
      l.inbox,
      l.indirectFloorSlot,
      l.identifier,
    );
  },
  writeableReference: (l) => {
    return P.alt<Language['writeableReference']>(
      // -
      l.outbox,
      l.indirectFloorSlot,
      l.identifier,
    );
  },
  readableAssignmentExpression: (l) => {
    return P.seq(
      l.identifier,
      P.whitespace,
      P.string('='),
      P.whitespace,
      l.readableReference,
    ).map((result) => {
      return new ReadableAssignmentExpressionNode(result[0], result[4]);
    });
  },
  incrementAssignmentExpression: (l) => {
    return P.seq(
      // -
      l.identifier,
      P.whitespace,
      P.string('+='),
      P.whitespace,
      P.string('1'),
    ).map((result) => {
      return new IncrementAssignmentExpressionNode(result[0]);
    });
  },
  decrementAssignmentExpression: (l) => {
    return P.seq(
      // -
      l.identifier,
      P.whitespace,
      P.string('-='),
      P.whitespace,
      P.string('1'),
    ).map((result) => {
      return new DecrementAssignmentExpressionNode(result[0]);
    });
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
    return P.regex(/[a-z][a-z0-9]*/).map((result) => {
      return new IdentifierNode(result);
    });
  },

  word: () => {
    return P.regex(/[a-z]+/);
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
  const compiledNodes = block.compile(context);
  const compiledLabels = [...context.floorBindingByKey.values()].flatMap(
    (binding) => {
      return new LabelDefinitionNode(binding).compileStatement(context);
    },
  );
  const compiledParts = [...compiledNodes, ...compiledLabels];

  const result = compiledParts
    .map((part) => part.serialized.trimEnd())
    .join('\n');

  return result;
};
