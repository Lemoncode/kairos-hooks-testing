import React from "react";
import { usePromiseTracker } from "react-promise-tracker";
import { ThreeDots } from "react-loader-spinner";

export const LoadingIndicator = () => {
  const { promiseInProgress } = usePromiseTracker();

  return (
    promiseInProgress && (
      <div
        style={{
          width: "100%",
          height: "100",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ThreeDots color="#2BAD60" height="100" width="100" />
      </div>
    )
  );
};
