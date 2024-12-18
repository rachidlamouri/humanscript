import P from 'parsimmon';
import {
  AssignmentStatementNode,
  DualAssignmentStatementNode,
  ReadableAssignmentExpressionNode,
} from './nodes/statements/assignmentStatementNode';
import { createLanguage, parserDebugger, ul } from '../utils/parserUtils';
import { assertIsArray, isArray } from '../utils/assertIsArray';
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
import {
  CompoundConditionConstructor,
  Condition,
  isCondition,
} from './nodes/conditions/condition';
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
import { FloorReferenceNode } from './nodes/references/floorReferenceNode';
import { OrConditionNode } from './nodes/conditions/orConditionNode';
import { SwapStatementNode } from './nodes/statements/swapStatementNode';

type NestedStatementNodeList = [Statement, unknown];

type NestedConditionResult = [CompoundConditionConstructor, Condition, unknown];

function assertIsNestedConditionResult(
  value: unknown,
): asserts value is NestedConditionResult | null {
  if (
    value === null ||
    (isArray(value) &&
      value.length === 3 &&
      typeof value[0] === 'function' &&
      isCondition(value[1]))
  ) {
    return;
  }

  throw new Error('Unknown nested condition result');
}

type Language = {
  program: BlockNode;

  statementList: Statement[];
  recursiveStatementList: NestedStatementNodeList;
  statement: Statement;

  assemblyComment: AssemblyCommentReferenceNode;
  humanscriptComment: HumanscriptCommentNode;

  floorInit: FloorInitNode;
  floorReservation: FloorRange[];
  floorReservationList: FloorRange[];
  floorReservationValue: FloorRange;
  floorRange: FloorRange;
  floorIndex: FloorRange;

  letStatement: LetStatementNode;
  labelDefinition: string | null;
  directFloorSlot: FloorIndex;

  whileStatement: WhileStatementNode;
  ifStatement: IfStatementNode;
  elseStatement: BlockNode;
  block: BlockNode;

  conditionExpression: Condition;
  conditionExpression1: Condition;
  conditionExpression1Prime: NestedConditionResult | null;
  conditionExpression2: Condition;
  conditionExpression2Prime: NestedConditionResult | null;
  conditionExpression3: Condition;

  leftComparable: LeftComparable;
  rightComparable: RightComparable;

  assignmentStatement: AssignmentStatementNode;
  singleAssignmentStatement: AssignmentStatementNode;
  dualAssignmentStatement: DualAssignmentStatementNode;
  singleAssignmentExpression: [WriteableReference, ReadableExpression];
  readableExpression: ReadableExpression;
  readableAssignmentExpression: ReadableAssignmentExpressionNode;
  swapStatement: SwapStatementNode;

  incrementAssignmentStatement: IncrementAssignmentStatementNode;
  incrementAssignmentExpression: IncrementAssignmentExpressionNode;
  decrementAssignmentStatement: DecrementAssignmentStatementNode;
  decrementAssignmentExpression: DecrementAssignmentExpressionNode;

  mathExpression:
    | AdditiveExpressionNode
    | MultiplicativeExpressionNode
    | NegationExpressionNode;
  additiveExpression: AdditiveExpressionNode;
  multiplicativeExpression: MultiplicativeExpressionNode;
  negationExpression: NegationExpressionNode;

  readableReference: ReadableReference;
  writeableReference: WriteableReference;
  inbox: InboxNode;
  outbox: OutboxNode;

  floorReference: IdentifierNode | IndirectFloorSlotNode;
  identifier: IdentifierNode;
  indirectFloorSlot: IndirectFloorSlotNode;

  zeroLiteral: ZeroLiteralNode;
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
      l.swapStatement,
      l.floorInit,
    );
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
      l.floorReservationList,
    ).map((result) => {
      return result[2];
    });
  },
  floorReservationList: (l) => {
    return P.alt<Language['floorReservationList']>(
      P.seq(
        l.floorReservationValue,
        P.optWhitespace,
        P.string(','),
        P.optWhitespace,
        l.floorReservationList,
      ).map((result) => {
        return [result[0], ...result[4]];
      }),
      l.floorReservationValue.map((range) => [range]),
    );
  },
  floorReservationValue: (l) => {
    return P.alt<Language['floorReservationValue']>(
      // -
      l.floorRange,
      l.floorIndex,
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
  floorIndex: (l) => {
    return l.positiveInteger.map((index) => {
      return [index, index];
    });
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
  labelDefinition: (l) => {
    return P.seq(
      // -
      P.string('labeled'),
      P.whitespace,
      l.word,
    ).map((result) => {
      return result[2];
    });
  },
  directFloorSlot: (l) => {
    return P.seq(
      //-
      P.string('at'),
      P.whitespace,
      l.positiveInteger,
    ).map((result) => {
      return result[2];
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

  conditionExpression: (l) => {
    return P.seq(
      P.string('('),
      P.optWhitespace,
      l.conditionExpression1,
      P.optWhitespace,
      P.string(')'),
    ).map((result) => {
      return result[2];
    });
  },
  conditionExpression1: (l) => {
    return P.seq(
      // -
      l.conditionExpression2,
      l.conditionExpression1Prime,
    ).map((result) => {
      let nextLeft = result[0];
      let nextNestedRight = result[1];
      while (nextNestedRight !== null) {
        const [Constructor, nextRight, nested] = nextNestedRight;

        assertIsNestedConditionResult(nested);

        nextLeft = new Constructor(nextLeft, nextRight);
        nextNestedRight = nested;
      }

      return nextLeft;
    });
  },
  conditionExpression1Prime: (l) => {
    return ul
      .opt(
        P.seq(
          // -
          P.optWhitespace,
          P.string('||'),
          P.optWhitespace,
          l.conditionExpression2,
          l.conditionExpression1Prime,
        ),
      )
      .map((result) => {
        if (result === null) {
          return null;
        }

        const right = result[3];
        const nestedRight = result[4];

        return [OrConditionNode, right, nestedRight];
      });
  },
  conditionExpression2: (l) => {
    return P.seq(
      // -
      l.conditionExpression3,
      l.conditionExpression2Prime,
    ).map((result) => {
      let nextLeft = result[0];
      let nextNestedRight = result[1];
      while (nextNestedRight !== null) {
        const [Constructor, nextRight, nested] = nextNestedRight;

        assertIsNestedConditionResult(nested);

        nextLeft = new Constructor(nextLeft, nextRight);
        nextNestedRight = nested;
      }

      return nextLeft;
    });
  },
  conditionExpression2Prime: (l) => {
    return ul
      .opt(
        P.seq(
          // -
          P.optWhitespace,
          P.string('&&'),
          P.optWhitespace,
          l.conditionExpression3,
          l.conditionExpression2Prime,
        ),
      )
      .map((result) => {
        if (result === null) {
          return null;
        }

        const right = result[3];
        const nestedRight = result[4];

        return [AndConditionNode, right, nestedRight];
      });
  },
  conditionExpression3: (l) => {
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
      // -
      l.zeroLiteral,
      l.readableReference,
    );
  },

  assignmentStatement: (l) => {
    return P.alt<Language['assignmentStatement']>(
      l.dualAssignmentStatement,
      l.singleAssignmentStatement,
    );
  },
  singleAssignmentStatement: (l) => {
    return l.singleAssignmentExpression.map((result) => {
      const writeable = result[0];
      const readable = result[1];
      return new AssignmentStatementNode(writeable, readable);
    });
  },
  dualAssignmentStatement: (l) => {
    return P.seq(
      // -
      l.writeableReference,
      P.optWhitespace,
      P.string(','),
      P.optWhitespace,
      l.singleAssignmentExpression,
    ).map((result) => {
      const firstWriteable = result[0];
      const secondWriteable = result[4][0];
      const readable = result[4][1];

      if (readable instanceof FlooredDivisionExpressionNode) {
        return new DualAssignmentStatementNode(
          firstWriteable,
          secondWriteable,
          readable,
        );
      }

      throw new Error(
        `Dual assignment is only allowed with floor division "~/". Attempted to dual read from a "${readable.constructor.name}"`,
      );
    });
  },
  singleAssignmentExpression: (l) => {
    return P.seq(
      // -
      l.writeableReference,
      P.whitespace,
      P.string('='),
      P.whitespace,
      l.readableExpression,
    ).map((result) => [result[0], result[4]]);
  },
  readableExpression: (l) => {
    return P.alt<Language['readableExpression']>(
      // -
      l.mathExpression,
      l.readableReference,
    );
  },
  readableAssignmentExpression: (l) => {
    return P.seq(
      l.floorReference,
      P.whitespace,
      P.string('='),
      P.whitespace,
      l.readableReference,
    ).map((result) => {
      return new ReadableAssignmentExpressionNode(result[0], result[4]);
    });
  },
  swapStatement: (l) => {
    return P.seq(
      l.floorReference,
      P.optWhitespace,
      P.string('<->'),
      P.optWhitespace,
      l.floorReference,
    ).map((result) => {
      return new SwapStatementNode(result[0], result[4]);
    });
  },

  incrementAssignmentStatement: (l) => {
    return l.incrementAssignmentExpression;
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
  decrementAssignmentStatement: (l) => {
    return l.decrementAssignmentExpression;
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
      l.floorReference,
      P.optWhitespace,
      P.alt<MultiplicativeExpressionNodeConstructor>(
        P.string('*').result(MultiplicationExpressionNode),
        P.string('~/').result(FlooredDivisionExpressionNode),
        P.string('%').result(ModuloExpressionNode),
      ),
      P.optWhitespace,
      l.floorReference,
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

  readableReference: (l) => {
    return P.alt<Language['readableReference']>(
      // -
      l.inbox,
      l.floorReference,
    );
  },
  writeableReference: (l) => {
    return P.alt<Language['writeableReference']>(
      // -
      l.outbox,
      l.floorReference,
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

  floorReference: (l) => {
    return P.alt<FloorReferenceNode>(
      // -
      l.indirectFloorSlot,
      l.identifier,
    );
  },
  identifier: (l) => {
    return l.word.map((result) => {
      return new IdentifierNode(result);
    });
  },
  indirectFloorSlot: (l) => {
    return P.seq(
      //-
      P.string('floor'),
      P.string('['),
      l.word,
      P.string(']'),
    ).map((result) => {
      return new IndirectFloorSlotNode(result[2]);
    });
  },

  zeroLiteral: () => {
    return P.string('0').map(() => new ZeroLiteralNode());
  },
  word: () => {
    return P.regex(/[a-z][a-z0-9]*/);
  },
  positiveInteger: () => {
    return P.regex(/[1-9][0-9]*|0/).map((result) => {
      const value = Number.parseInt(result, 10);
      return value;
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
