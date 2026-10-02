import Chatbot from "@/components/Chatbot";
import { PageTitle } from "@/components/ui";

export default function CandidateChat() {
  return (<><PageTitle title="Career assistant" sub="Ask about skills, roles and how to improve your resume." /><Chatbot placeholder="e.g. What skills do I need to become a DevOps engineer?" /></>);
}
