const tickets = new Map();
const agents = new Map();
const ticketHistory = [];
const usedEmails = new Set();
const usedTicketNumbers = new Set();

let nextTicketId = 1001;
let nextAgentId = 501;

const STATUSES = new Set([
  "open",
  "in-progress",
  "pending",
  "resolved",
  "closed"
]);

const PRIORITIES = new Map([
  ["low", 1],
  ["medium", 2],
  ["high", 3],
  ["critical", 4]
]);

const TRANSITIONS = new Map([
  ["open", new Set(["in-progress", "pending", "resolved", "closed"])],
  ["in-progress", new Set(["open", "pending", "resolved"])],
  ["pending", new Set(["open", "in-progress", "resolved"])],
  ["resolved", new Set(["open", "closed"])],
  ["closed", new Set(["open"])]
]);

const normalize = (value) => String(value).trim().toLowerCase();

const addAgent = ({ name, email, skills = [] }) => {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Agent name is required.");
  }

  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw new Error("A valid email address is required.");
  }

  const normalizedEmail = normalize(email);

  if (usedEmails.has(normalizedEmail)) {
    throw new Error("This email is already registered.");
  }

  if (!Array.isArray(skills)) {
    throw new Error("Skills must be an array.");
  }

  const agent = {
    id: nextAgentId++,
    name: name.trim(),
    email: normalizedEmail,
    skills: new Set(
      skills.map((skill) => normalize(skill)).filter(Boolean)
    ),
    active: true,
    assignedTickets: new Set(),
    resolvedCount: 0,
    createdAt: new Date().toISOString()
  };

  agents.set(agent.id, agent);
  usedEmails.add(normalizedEmail);

  return agent;
};

const getTicket = (id) => tickets.get(id) ?? null;

const getAgent = (id) => agents.get(id) ?? null;

const addTicket = ({
  title,
  description,
  customer,
  category,
  priority = "medium"
}) => {
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Ticket title is required.");
  }

  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Ticket description is required.");
  }

  if (typeof customer !== "string" || !customer.trim()) {
    throw new Error("Customer name is required.");
  }

  if (typeof category !== "string" || !category.trim()) {
    throw new Error("Ticket category is required.");
  }

  const normalizedPriority = normalize(priority);

  if (!PRIORITIES.has(normalizedPriority)) {
    throw new Error("Invalid ticket priority.");
  }

  const now = new Date().toISOString();
  const id = nextTicketId++;

  const ticket = {
    id,
    title: title.trim(),
    description: description.trim(),
    customer: customer.trim(),
    category: normalize(category),
    priority: normalizedPriority,
    status: "open",
    assignedAgentId: null,
    comments: [],
    tags: new Set(),
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    closedAt: null
  };

  tickets.set(id, ticket);

  recordHistory(id, "created", {
    status: "open",
    priority: normalizedPriority
  });

  return ticket;
};

const recordHistory = (ticketId, action, details = {}) => {
  const event = {
    id: ticketHistory.length + 1,
    ticketId,
    action,
    details: structuredClone(details),
    timestamp: new Date().toISOString()
  };

  ticketHistory.push(event);

  return event;
};

const assignTicket = (ticketId, agentId) => {
  const ticket = getTicket(ticketId);
  const agent = getAgent(agentId);

  if (!ticket) throw new Error("Ticket not found.");
  if (!agent) throw new Error("Agent not found.");
  if (!agent.active) throw new Error("Agent is inactive.");
  if (ticket.status === "closed") {
    throw new Error("Cannot assign a closed ticket.");
  }

  const previousAgentId = ticket.assignedAgentId;

  if (previousAgentId === agentId) {
    return ticket;
  }

  if (previousAgentId !== null) {
    getAgent(previousAgentId)?.assignedTickets.delete(ticketId);
  }

  ticket.assignedAgentId = agentId;
  ticket.updatedAt = new Date().toISOString();
  agent.assignedTickets.add(ticketId);

  recordHistory(ticketId, "assigned", {
    previousAgentId,
    agentId
  });

  return ticket;
};

const unassignTicket = (ticketId) => {
  const ticket = getTicket(ticketId);

  if (!ticket) throw new Error("Ticket not found.");
  if (ticket.assignedAgentId === null) return false;

  const previousAgentId = ticket.assignedAgentId;

  getAgent(previousAgentId)?.assignedTickets.delete(ticketId);

  ticket.assignedAgentId = null;
  ticket.updatedAt = new Date().toISOString();

  recordHistory(ticketId, "unassigned", {
    previousAgentId
  });

  return true;
};

const changeTicketStatus = (ticketId, newStatus) => {
  const ticket = getTicket(ticketId);
  const status = normalize(newStatus);

  if (!ticket) throw new Error("Ticket not found.");
  if (!STATUSES.has(status)) {
    throw new Error("Invalid ticket status.");
  }

  if (ticket.status === status) return ticket;

  if (!TRANSITIONS.get(ticket.status).has(status)) {
    throw new Error(
      `Cannot change status from ${ticket.status} to ${status}.`
    );
  }

  const previousStatus = ticket.status;
  const now = new Date().toISOString();

  ticket.status = status;
  ticket.updatedAt = now;

  if (status === "resolved") {
    ticket.resolvedAt = now;

    const agent = getAgent(ticket.assignedAgentId);

    if (agent) {
      agent.resolvedCount++;
    }
  }

  if (previousStatus === "resolved" && status === "open") {
    const agent = getAgent(ticket.assignedAgentId);

    if (agent && agent.resolvedCount > 0) {
      agent.resolvedCount--;
    }

    ticket.resolvedAt = null;
  }

  if (status === "closed") {
    ticket.closedAt = now;
  }

  if (previousStatus === "closed" && status === "open") {
    ticket.closedAt = null;
  }

  recordHistory(ticketId, "status-changed", {
    previousStatus,
    newStatus: status
  });

  return ticket;
};

const changePriority = (ticketId, priority) => {
  const ticket = getTicket(ticketId);
  const normalizedPriority = normalize(priority);

  if (!ticket) throw new Error("Ticket not found.");

  if (!PRIORITIES.has(normalizedPriority)) {
    throw new Error("Invalid priority.");
  }

  const previousPriority = ticket.priority;

  ticket.priority = normalizedPriority;
  ticket.updatedAt = new Date().toISOString();

  recordHistory(ticketId, "priority-changed", {
    previousPriority,
    newPriority: normalizedPriority
  });

  return ticket;
};

const addComment = (ticketId, author, message) => {
  const ticket = getTicket(ticketId);

  if (!ticket) throw new Error("Ticket not found.");

  if (typeof author !== "string" || !author.trim()) {
    throw new Error("Comment author is required.");
  }

  if (typeof message !== "string" || !message.trim()) {
    throw new Error("Comment message is required.");
  }

  const comment = {
    id: ticket.comments.length + 1,
    author: author.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString()
  };

  ticket.comments.push(comment);
  ticket.updatedAt = comment.createdAt;

  recordHistory(ticketId, "comment-added", {
    author: comment.author,
    commentId: comment.id
  });

  return comment;
};

const addTag = (ticketId, tag) => {
  const ticket = getTicket(ticketId);

  if (!ticket) throw new Error("Ticket not found.");
  if (typeof tag !== "string" || !tag.trim()) {
    throw new Error("Tag cannot be empty.");
  }

  const normalizedTag = normalize(tag);
  const added = !ticket.tags.has(normalizedTag);

  ticket.tags.add(normalizedTag);

  if (added) {
    ticket.updatedAt = new Date().toISOString();
    recordHistory(ticketId, "tag-added", {
      tag: normalizedTag
    });
  }

  return added;
};

const removeTag = (ticketId, tag) => {
  const ticket = getTicket(ticketId);

  if (!ticket) throw new Error("Ticket not found.");

  const normalizedTag = normalize(tag);
  const removed = ticket.tags.delete(normalizedTag);

  if (removed) {
    ticket.updatedAt = new Date().toISOString();
    recordHistory(ticketId, "tag-removed", {
      tag: normalizedTag
    });
  }

  return removed;
};

const searchTickets = (query) => {
  const term = normalize(query);

  return [...tickets.values()].filter((ticket) =>
    String(ticket.id).includes(term) ||
    ticket.title.toLowerCase().includes(term) ||
    ticket.description.toLowerCase().includes(term) ||
    ticket.customer.toLowerCase().includes(term) ||
    ticket.category.includes(term) ||
    [...ticket.tags].some((tag) => tag.includes(term))
  );
};

const filterTickets = ({
  status,
  priority,
  category,
  agentId,
  tag
} = {}) => {
  return [...tickets.values()].filter((ticket) => {
    if (status && ticket.status !== normalize(status)) return false;
    if (priority && ticket.priority !== normalize(priority)) return false;
    if (category && ticket.category !== normalize(category)) return false;
    if (agentId !== undefined && ticket.assignedAgentId !== agentId) {
      return false;
    }
    if (tag && !ticket.tags.has(normalize(tag))) return false;

    return true;
  });
};

const sortTickets = (
  key = "createdAt",
  direction = "desc"
) => {
  const allowedKeys = [
    "id",
    "title",
    "status",
    "priority",
    "category",
    "createdAt",
    "updatedAt"
  ];

  if (!allowedKeys.includes(key)) {
    throw new Error("Unsupported sort key.");
  }

  if (!["asc", "desc"].includes(direction)) {
    throw new Error('Direction must be "asc" or "desc".');
  }

  const multiplier = direction === "asc" ? 1 : -1;

  return [...tickets.values()].sort((a, b) => {
    if (key === "priority") {
      return (
        (PRIORITIES.get(a.priority) - PRIORITIES.get(b.priority)) *
        multiplier
      );
    }

    const first = a[key];
    const second = b[key];

    if (typeof first === "string") {
      return first.localeCompare(second) * multiplier;
    }

    return (first - second) * multiplier;
  });
};

const getAgentWorkload = (agentId) => {
  const agent = getAgent(agentId);

  if (!agent) throw new Error("Agent not found.");

  const assigned = [...agent.assignedTickets]
    .map((id) => getTicket(id))
    .filter(Boolean);

  const active = assigned.filter(
    (ticket) => !["resolved", "closed"].includes(ticket.status)
  );

  return {
    agentId,
    name: agent.name,
    totalAssigned: assigned.length,
    activeTickets: active.length,
    resolvedCount: agent.resolvedCount,
    tickets: assigned
  };
};

const getAvailableAgent = (category) => {
  const requiredSkill = normalize(category);

  return [...agents.values()]
    .filter((agent) =>
      agent.active &&
      agent.skills.has(requiredSkill)
    )
    .map((agent) => ({
      agent,
      workload: getAgentWorkload(agent.id).activeTickets
    }))
    .sort((a, b) => a.workload - b.workload)[0]?.agent ?? null;
};

const autoAssignTicket = (ticketId) => {
  const ticket = getTicket(ticketId);

  if (!ticket) throw new Error("Ticket not found.");

  const agent = getAvailableAgent(ticket.category);

  if (!agent) {
    throw new Error("No available agent has the required skill.");
  }

  return assignTicket(ticketId, agent.id);
};

const getTicketHistory = (ticketId) => {
  if (!tickets.has(ticketId)) {
    throw new Error("Ticket not found.");
  }

  return ticketHistory.filter(
    (event) => event.ticketId === ticketId
  );
};

const getDashboardStatistics = () => {
  const statusCounts = new Map(
    [...STATUSES].map((status) => [status, 0])
  );

  const priorityCounts = new Map(
    [...PRIORITIES.keys()].map((priority) => [priority, 0])
  );

  const categoryCounts = new Map();

  for (const ticket of tickets.values()) {
    statusCounts.set(
      ticket.status,
      statusCounts.get(ticket.status) + 1
    );

    priorityCounts.set(
      ticket.priority,
      priorityCounts.get(ticket.priority) + 1
    );

    categoryCounts.set(
      ticket.category,
      (categoryCounts.get(ticket.category) ?? 0) + 1
    );
  }

  return {
    totalTickets: tickets.size,
    totalAgents: agents.size,
    openTickets: filterTickets({ status: "open" }).length,
    inProgressTickets: filterTickets({ status: "in-progress" }).length,
    pendingTickets: filterTickets({ status: "pending" }).length,
    resolvedTickets: filterTickets({ status: "resolved" }).length,
    closedTickets: filterTickets({ status: "closed" }).length,
    unassignedTickets: [...tickets.values()].filter(
      (ticket) => ticket.assignedAgentId === null
    ).length,
    criticalTickets: filterTickets({ priority: "critical" }).length,
    statusCounts: Object.fromEntries(statusCounts),
    priorityCounts: Object.fromEntries(priorityCounts),
    categoryCounts: Object.fromEntries(categoryCounts)
  };
};

const displayTickets = () => {
  console.table(
    [...tickets.values()].map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
      customer: ticket.customer,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      assignedAgent:
        getAgent(ticket.assignedAgentId)?.name ?? "Unassigned"
    }))
  );
};

const agent1 = addAgent({
  name: "Jane Developer",
  email: "jane@example.com",
  skills: ["technical", "billing"]
});

const agent2 = addAgent({
  name: "Mark Support",
  email: "mark@example.com",
  skills: ["account", "technical"]
});

const ticket1 = addTicket({
  title: "Cannot log in",
  description: "The customer cannot access their account.",
  customer: "Alex Mwangi",
  category: "account",
  priority: "high"
});

const ticket2 = addTicket({
  title: "Payment failed",
  description: "The payment request returns an error.",
  customer: "Mary Wanjiku",
  category: "billing",
  priority: "critical"
});

const ticket3 = addTicket({
  title: "Application error",
  description: "The dashboard fails to load.",
  customer: "David Otieno",
  category: "technical",
  priority: "medium"
});

assignTicket(ticket1.id, agent2.id);
autoAssignTicket(ticket2.id);
autoAssignTicket(ticket3.id);

addComment(
  ticket1.id,
  "Mark Support",
  "Investigating the login issue."
);

addTag(ticket1.id, "authentication");
addTag(ticket2.id, "payment");

changeTicketStatus(ticket1.id, "in-progress");
changeTicketStatus(ticket2.id, "pending");

console.log("Search:", searchTickets("payment"));
console.log("Critical tickets:", filterTickets({ priority: "critical" }));
console.log("Agent workload:", getAgentWorkload(agent2.id));
console.log("Ticket history:", getTicketHistory(ticket1.id));
console.log("Dashboard:", getDashboardStatistics());

displayTickets();