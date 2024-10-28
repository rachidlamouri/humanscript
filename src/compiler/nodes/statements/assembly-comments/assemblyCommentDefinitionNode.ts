import { Assembly } from '../../../assembly';
import { Compiled } from '../../../compiled';
import { CompilerContext } from '../../../compilerContext';
import { Node } from '../../node';
import { Statement } from '../statement';
import { AssemblyCommentReferenceNode } from './assemblyCommentStatementNode';

export class AssemblyCommentDefinitionNode extends Node implements Statement {
  constructor(public reference: AssemblyCommentReferenceNode) {
    super();
  }

  compileStatement(context: CompilerContext): Compiled {
    const index = context.getCommentIndex(this.reference);
    const text = this.reference.text;

    return [Assembly.DEFINE_COMMENT(context, index, text)];
  }

  flatten(accumulator: Node[]): void {
    accumulator.push(this);
  }
}
