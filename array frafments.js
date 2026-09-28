const shuffledFragments = [

  { id: 15, text: "and, after a time, passed the place where the Hare was sleeping." },

  { id: 12, text: "he lay down beside the course to take a nap" },

  ,

  { id: 11, text: "and to make the Tortoise feel very deeply how ridiculous it was for him to try a race with a Hare," },

  { id: 7, text: "but for the fun of the thing he agreed." },

  { id: 19, text: "The Hare now ran his swiftest," },

  ,

  { id: 1, text: "A Hare was making fun of the Tortoise one day for being so slow." },

  { id: 14, text: "The Tortoise meanwhile kept going slowly but steadily," },

  { id: 9, text: "marked the distance and started the runners off." },

  ,

  { id: 5, text: "I'll run you a race and prove it.\"" },

  { id: 17, text: "and when at last he did wake up," },

  { id: 2, text: '"Do you ever get anywhere?" he asked with a mocking laugh.' },

  { id: 12, text: "he lay down beside the course to take a nap" },

  ,

  { id: 8, text: "So the Fox, who had consented to act as judge," },

  { id: 20, text: "but he could not overtake the Tortoise in time." },

  { id: 5, text: "I'll run you a race and prove it.\"" },

  { id: 6, text: "The Hare was much amused at the idea of running a race with the Tortoise," },

  ,

  { id: 13, text: "until the Tortoise should catch up." },

  { id: 10, text: "The Hare was soon far out of sight," },

  { id: 12, text: "he lay down beside the course to take a nap" },

  { id: 18, text: "the Tortoise was near the goal." },

];

function compactFragments(fragments) {
  let result = [];
  let compacted = false;

  for (let i = 0; i < fragments.length; i++) {
    if (fragments[i] !== undefined) {
      result.push(fragments[i]);
    } else {
      compacted = true;
    }
  }

  if (compacted) {
    console.log("[COMPACTED] Undefined fragments removed.");
  }

  return result;
}

const compactedShuffledFragments = compactFragments(shuffledFragments);

function sortFragments(fragments) {
  let result = [];

  for (let i = 0; i < fragments.length; i++) {
    let current = fragments[i];
    let inserted = false;

    for (let j = 0; j < result.length; j++) {
      if (current.id < result[j].id) {
        result.splice(j, 0, current);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      result.push(current);
    }
  }

  return result;
}

const sortedFragments = sortFragments(compactedShuffledFragments);

function dedupeFragments(fragments) {
  let result = [];

  for (let i = 0; i < fragments.length; i++) {
    if (i === 0 || fragments[i].id !== fragments[i - 1].id) {
      result.push(fragments[i]);
    } else {
      console.log(`[DEDUPED] Duplicate fragment with id ${fragments[i].id} removed.`);
    }
  }

  return result;
}

const dedupedFragments = dedupeFragments(sortedFragments);

function fillMissingFragments(fragments) {
  let result = [];

  for (let i = 0; i < fragments.length; i++) {
    result.push(fragments[i]);

    if (i < fragments.length - 1) {
      let currentId = fragments[i].id;
      let nextId = fragments[i + 1].id;

      for (let id = currentId + 1; id < nextId; id++) {
        result.push({
          id: id,
          text: "[...]"
        });

        console.log(`[FILLED] Missing fragment with id ${id} added.`);
      }
    }
  }

  return result;
}

const filledFragments = fillMissingFragments(dedupedFragments);

function assembleStory(fragments) {
  let story = "";

  for (let i = 0; i < fragments.length; i++) {
    if (i > 0) {
      story += "\n";
    }

    story += fragments[i].text;
  }

  return story;
}

console.log(assembleStory(filledFragments));