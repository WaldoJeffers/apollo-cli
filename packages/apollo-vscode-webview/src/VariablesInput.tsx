import * as React from "react";

import { VariableEditor } from "graphiql/dist/components/VariableEditor";

import "graphiql/graphiql.css";
import { vscode } from ".";
import { GraphQLSchema, typeFromAST, GraphQLType, TypeNode } from "graphql";

import "./VariablesInput.css";
import { RequestedVariable } from "./App";

function getBaseVariables(requestedVariables: RequestedVariable[]) {
  const obj: { [name: string]: null } = {};
  requestedVariables
    .filter(v => (v.typeNode as TypeNode).kind == "NonNullType")
    .forEach(v => {
      obj[v.name] = null;
    });

  return obj;
}

export class VariablesInput extends React.Component<
  { requestedVariables: RequestedVariable[]; schema: GraphQLSchema },
  { variables: any }
> {
  constructor(props: {
    requestedVariables: RequestedVariable[];
    schema: GraphQLSchema;
  }) {
    super(props);
    this.state = { variables: getBaseVariables(props.requestedVariables) };
  }

  public componentWillReceiveProps(
    _: { requestedVariables: RequestedVariable[] },
    nextProps: { requestedVariables: RequestedVariable[] }
  ) {
    this.setState({
      variables: getBaseVariables(nextProps.requestedVariables)
    });
  }

  public render() {
    const variableToType: { [v: string]: GraphQLType } = {};
    this.props.requestedVariables.forEach(r => {
      variableToType[r.name] = typeFromAST(
        this.props.schema,
        r.typeNode as any
      )!;
    });

    return (
      <div className="variables-input">
        <button
          style={{
            margin: "20px",
            fontSize: "25px"
          }}
          onClick={() => {
            vscode.postMessage({
              type: "variables",
              content: this.state.variables
            });
          }}
        >
          Run
        </button>
        <VariableEditor
          value={JSON.stringify(this.state.variables, undefined, 2)}
          onEdit={(v: string) => {
            this.setState({ variables: JSON.parse(v) });
          }}
          variableToType={variableToType}
        />
      </div>
    );
  }
}
