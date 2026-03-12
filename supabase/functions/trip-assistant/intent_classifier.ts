export type Intent =
  | "DESTINATIONS"
  | "WILDLIFE"
  | "CULTURAL_EVENTS"
  | "GUIDES"
  | "EXPERIENCES"
  | "FOOD"
  | "TRANSPORT"
  | "SAFETY"
  | "MARKETPLACE"
  | "UNKNOWN";

export const classifyIntent = (prompt: string): Intent => {
  const q = prompt.toLowerCase();

  if (/(wildlife|sighting|elephant|lion|leopard|rhino|buffalo|cheetah|migration|big five|bird)/i.test(q)) {
    return "WILDLIFE";
  }
  if (/(event|festival|calendar|cultural event|ceremony|celebration)/i.test(q)) {
    return "CULTURAL_EVENTS";
  }
  if (/(guide|tour guide|local guide|guide me|guided tour)/i.test(q)) {
    return "GUIDES";
  }
  if (/(experience|activity|adventure|immersion|walk|tour|hike)/i.test(q)) {
    return "EXPERIENCES";
  }
  if (/(food|restaurant|dish|cuisine|dining|kitchen|eat)/i.test(q)) {
    return "FOOD";
  }
  if (/(transport|route|trail|logistics|bus|shuttle|vehicle|transfer|road|fuel|drive)/i.test(q)) {
    return "TRANSPORT";
  }
  if (/(safety|alert|emergency|risk|security|hospital|clinic)/i.test(q)) {
    return "SAFETY";
  }
  if (/(market|marketplace|craft|produce|beadwork|shop|souvenir)/i.test(q)) {
    return "MARKETPLACE";
  }
  if (/(destination|county|where to go|hidden gem|place to visit)/i.test(q)) {
    return "DESTINATIONS";
  }

  return "UNKNOWN";
};
