import { seedReviews, generateId } from './data';
import { ReviewStatus } from '../types';

// In-memory store
let reviews = [...seedReviews];

function delay(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Validation ---

export async function validateEsatsId(esatsId) {
  await delay(1000);
  const num = Number(esatsId);
  if (!num || num <= 0) return { valid: false, message: 'Invalid ESATS ID.' };
  // Mock: IDs divisible by 7 are "not found"
  if (num % 7 === 0) return { valid: false, message: `ESATS ID ${esatsId} not found in system.` };
  return { valid: true, message: `ESATS ID ${esatsId} validated successfully.` };
}

// --- Read operations ---

export async function fetchReviews() {
  await delay(500);
  return [...reviews];
}

export async function fetchReviewById(id) {
  await delay(400);
  const review = reviews.find((r) => r.id === id);
  if (!review) throw new Error(`Review ${id} not found`);
  return { ...review };
}

export async function fetchReviewsByStatus(status) {
  await delay(500);
  return reviews.filter((r) => r.status === status).map((r) => ({ ...r }));
}

export async function fetchReviewsBySubmitter(userId) {
  await delay(500);
  return reviews.filter((r) => r.submittedBy.id === userId).map((r) => ({ ...r }));
}

// --- Write operations ---

export async function submitReview(data) {
  await delay(800);
  const newReview = {
    id: generateId(),
    subject: data.subject,
    description: data.description,
    status: ReviewStatus.INTAKE_REVIEW,
    urgent: data.urgent || false,
    needByDate: data.needByDate,
    esatsId: data.esatsId || null,
    submittedDate: new Date().toISOString(),
    submittedBy: data.submittedBy,
    attachments: data.attachments.map((a) => ({
      type: a.type,
      fileName: a.fileName,
      fileSize: a.fileSize,
    })),
    scheduledDate: null,
    reviewNotes: [],
    reviewVotes: [],
    returnReason: null,
  };
  reviews = [newReview, ...reviews];
  return { ...newReview };
}

export async function resubmitReview(id, data) {
  await delay(800);
  reviews = reviews.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      subject: data.subject,
      description: data.description,
      urgent: data.urgent || false,
      needByDate: data.needByDate,
      esatsId: data.esatsId || r.esatsId,
      attachments: data.attachments.map((a) => ({
        type: a.type,
        fileName: a.fileName,
        fileSize: a.fileSize,
      })),
      status: ReviewStatus.INTAKE_REVIEW,
      returnReason: null,
    };
  });
  return fetchReviewById(id);
}

export async function returnToCustomer(id, reason) {
  await delay(600);
  reviews = reviews.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      status: ReviewStatus.CUSTOMER_WORK_NEEDED,
      returnReason: reason,
    };
  });
  return fetchReviewById(id);
}

export async function scheduleReview(id, scheduledDate) {
  await delay(600);
  reviews = reviews.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      status: ReviewStatus.TM_REVIEW_SCHEDULED,
      scheduledDate,
    };
  });
  return fetchReviewById(id);
}

export async function rescheduleReview(id, scheduledDate) {
  await delay(600);
  reviews = reviews.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      scheduledDate,
    };
  });
  return fetchReviewById(id);
}

export async function cancelReview(id) {
  await delay(600);
  reviews = reviews.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      status: ReviewStatus.CANCELED,
    };
  });
  return fetchReviewById(id);
}

export async function completeReview(id, { notes, votes, actionItems }) {
  await delay(800);
  reviews = reviews.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      status: ReviewStatus.TM_REVIEW_COMPLETE,
      reviewNotes: notes || r.reviewNotes,
      actionItems: actionItems || r.actionItems || [],
      reviewVotes: votes || r.reviewVotes,
    };
  });
  return fetchReviewById(id);
}

export async function addReviewNote(id, note) {
  await delay(400);
  reviews = reviews.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      reviewNotes: [...r.reviewNotes, note],
    };
  });
  return fetchReviewById(id);
}

export async function addReviewVote(id, vote) {
  await delay(400);
  reviews = reviews.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      reviewVotes: [...r.reviewVotes, vote],
    };
  });
  return fetchReviewById(id);
}

// --- Chat assistant ---

const chatResponses = [
  {
    keywords: ['submit', 'new review', 'start', 'request', 'create'],
    response:
      'To submit a new threat model review request:\n\n1. Click **"New TMR Request"** from the dashboard\n2. Fill in the **subject** and **description**\n3. Set the **need-by date** and check **urgent** if applicable\n4. Upload all **3 required attachments**:\n   - TMR Questionnaire\n   - Data Flow Diagram (B123C)\n   - Threat Findings Report (B124C)\n5. Click **Submit**\n\nYour request will enter the *Intake Review* queue for the TM team to review.',
  },
  {
    keywords: ['attachment', 'upload', 'file', 'document', 'questionnaire', 'diagram'],
    response:
      'Three attachments are **required** before you can submit:\n\n- **TMR Questionnaire** — the completed threat model questionnaire\n- **Data Flow Diagram (B123C)** — your application data flow diagram\n- **Threat Findings Report (B124C)** — any existing threat findings\n\nEach type accepts one file. You can remove and re-upload if needed.',
  },
  {
    keywords: ['status', 'state', 'process', 'workflow', 'lifecycle'],
    response:
      'The TMR lifecycle has **5 states**:\n\n1. **Customer Work Needed** — returned to you for rework\n2. **Intake Review** — submitted and awaiting TM team review\n3. **TM Review Scheduled** — a review meeting has been set\n4. **TM Review Complete** — the review is finished\n5. **Canceled** — the review was canceled\n\nEach state has different actions available. Let me know if you want details on a specific state!',
  },
  {
    keywords: ['schedule', 'meeting', 'reschedule', 'date', 'calendar'],
    response:
      'Once your submission passes intake review, the TM team will **schedule a review meeting**. You\'ll see the scheduled date on your review card.\n\nThe team can:\n- **Reschedule** to a future date if needed\n- **Start the review** during the meeting\n- **Cancel** if the review is no longer needed',
  },
  {
    keywords: ['cancel', 'canceled'],
    response:
      'A review can be **canceled** from most states. Once canceled, no further actions can be taken on that review.\n\nCanceled reviews are still visible in the *Canceled* tab for historical reference.',
  },
  {
    keywords: ['return', 'rework', 'customer work', 'rejected', 'sent back'],
    response:
      'If the TM team returns your review for rework, it moves to **Customer Work Needed** status. You\'ll see the reason provided by the team.\n\nFrom there, you can:\n- **Re-submit** with updated information and attachments\n- **Cancel** the review if it\'s no longer needed',
  },
  {
    keywords: ['vote', 'approve', 'reject', 'decision'],
    response:
      'During the review meeting, team members cast votes:\n\n- **Accept** — the threat model is approved\n- **Accept with Actions** — approved, but action items must be completed\n- **Reject** — the threat model needs significant rework\n\nThe review outcome is based on the collected votes.',
  },
  {
    keywords: ['urgent', 'priority', 'rush', 'fast'],
    response:
      'You can mark a request as **urgent** by checking the urgent checkbox when submitting.\n\nUrgent requests are flagged with a visual indicator so the TM team can prioritize them accordingly. Make sure your **need-by date** is set correctly as well.',
  },
  {
    keywords: ['help', 'how', 'what can you'],
    response:
      "I can help you with:\n\n- **Submitting reviews** — how to create a new request\n- **Attachment requirements** — what files you need\n- **Review process** — understanding the workflow states\n- **Scheduling** — how meetings get scheduled\n- **Voting & outcomes** — how reviews are decided\n\nJust ask me anything about the TMR process!",
  },
  {
    keywords: ['esats', 'id', 'application'],
    response:
      'The **ESATS ID** is your application\'s identifier in the enterprise system. It\'s validated when you submit your review request.\n\nMake sure you have the correct ESATS ID for the application you want reviewed. If validation fails, double-check the ID with your application team.',
  },
];

const fallbackResponses = [
  "That's a great question! While I don't have specific information on that topic, I'd recommend reaching out to the TM team directly for more details.\n\nIs there anything else about the **TMR process** I can help with?",
  "I'm not sure about that specific question. I'm best at helping with:\n\n- Submission requirements\n- Review process & states\n- Attachment requirements\n- Scheduling questions\n\nCould you rephrase or ask about one of these topics?",
  "Hmm, I don't have an answer for that right now. Try asking about **how to submit a review**, **required attachments**, or the **review lifecycle** — those are my specialties!",
];

export async function mockChatResponse(message) {
  await delay(800 + Math.random() * 700);
  const lower = message.toLowerCase();
  for (const entry of chatResponses) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}
