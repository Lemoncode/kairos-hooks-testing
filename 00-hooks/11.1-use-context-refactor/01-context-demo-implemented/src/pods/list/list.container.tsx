import React from "react";
import { ListComponent } from "./list.component";
import { MemberEntity } from "./list.vm";
import { getMemberCollection } from "./list.repository";
import { useMemberListContext } from "./list.provider";

export const ListContainer: React.FC = () => {
  const { memberList, loadMemberList } = useMemberListContext();

  React.useEffect(() => {
    loadMemberList();
  }, []);

  return <ListComponent members={memberList} />;
};
