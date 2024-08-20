import { Tab } from "../common/constants"
import TabParticipant from './tab-participants'
import Groups from './groups'

export default function ActivePage({ tab }: { tab: Tab }) {
  if (tab === Tab.Participants) {
    return <TabParticipant />
  }

  if (tab === Tab.Groups) {
    return <Groups />
  }
}
