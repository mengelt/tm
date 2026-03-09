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

export async function completeReview(id, { notes, votes }) {
  await delay(800);
  reviews = reviews.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      status: ReviewStatus.TM_REVIEW_COMPLETE,
      reviewNotes: notes || r.reviewNotes,
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
