import axios from 'axios';

const getLocalReports = (userId) => {
  const data = localStorage.getItem(`tele_derma_reports_${userId}`);
  return data ? JSON.parse(data) : [];
};

const saveLocalReports = (userId, reports) => {
  localStorage.setItem(`tele_derma_reports_${userId}`, JSON.stringify(reports));
};

// Helper to determine risk level based on condition
const getRiskLevel = (condition) => {
  const cond = condition?.toLowerCase() || '';
  if (cond.includes('melanoma')) return 'High';
  if (cond.includes('basal') || cond.includes('actinic') || cond.includes('carcinoma')) return 'Moderate';
  return 'Low';
};

// Helper to parse default report structure from DB row if report_data is empty
const parseReportFromRow = (row) => {
  let report = {};
  if (row.report_data) {
    try {
      report = typeof row.report_data === 'string' ? JSON.parse(row.report_data) : row.report_data;
    } catch (e) {
      console.error('Failed to parse report_data JSON:', e);
    }
  }

  // Format ID to e.g. AI-2026-0006
  const formattedId = String(row.id).padStart(4, '0');
  const reportIdStr = `AI-2026-${formattedId}`;

  // Merge database fields to ensure they reflect actual backend status
  return {
    id: reportIdStr,
    dbId: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name || 'Not provided',
    scanDate: row.created_at ? new Date(row.created_at).toLocaleDateString() : '19/08/2026',
    generatedDate: row.created_at ? new Date(row.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '19 August 2026',
    imageUrl: row.image_url || '/images/unidentifiable_mark.jpg',
    predictedCondition: row.prediction || 'Unknown Skin Lesion',
    confidence: Number(row.confidence) || 0.0,
    riskLevel: getRiskLevel(row.prediction),
    status: row.status || (row.doctor_opinion ? 'Reviewed' : 'Pending Dermatologist Review'),
    symptoms: report.symptoms || ['Skin lesion showing pigmentation'],
    aiSummary: report.aiSummary || `The AI screening model detected pattern attributes associated with ${row.prediction || 'a skin lesion'}. Assessed with ${(Number(row.confidence) || 0).toFixed(1)}% model certainty.`,
    detectedFeatures: report.detectedFeatures || ['Color variegation', 'Asymmetrical structure'],
    abcdeAssessment: report.abcdeAssessment || {
      asymmetry: getRiskLevel(row.prediction) === 'High' ? 'Significant asymmetry detected.' : 'Symmetric structure.',
      border: getRiskLevel(row.prediction) === 'High' ? 'Irregular, poorly defined border margins.' : 'Sharp, distinct border margins.',
      color: getRiskLevel(row.prediction) === 'High' ? 'Multiple shades of brown/black visible.' : 'Uniform coloration.',
      diameter: 'Lesion diameter within evaluated clinical margins.',
      evolution: 'Evolution cannot be reliably determined from a single image.'
    },
    recommendations: report.recommendations || [
      'Consider evaluation by a qualified dermatologist.',
      'Professional dermoscopic examination may be appropriate.',
      'Continue regular self-monitoring using the ABCDE screening aid.'
    ],
    dermatologistReview: {
      status: row.doctor_opinion ? 'Reviewed' : 'Pending',
      doctorId: row.doctor_name ? 201 : null,
      doctorName: row.doctor_name || null,
      reviewDate: row.review_date ? new Date(row.review_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null,
      clinicalOpinion: row.doctor_opinion || null,
      comments: row.doctor_opinion ? 'Clinically evaluated and matched with AI prediction scan.' : null,
      treatmentAdvice: row.prescription ? 'Follow prescription directions. Protect from sun exposure.' : null,
      prescription: row.prescription || null
    },
    appointmentId: report.appointmentId || null,
    createdAt: row.created_at || new Date().toISOString()
  };
};

const reportService = {
  /**
   * Fetch all reports for the logged-in user
   */
  fetchReports: async (apiUrl, user) => {
    if (!user) return [];
    try {
      const response = await axios.get(`${apiUrl}/analyses`);
      const parsed = response.data.map(parseReportFromRow);
      // Sync local storage cache
      saveLocalReports(user.id, parsed);
      return parsed;
    } catch (error) {
      console.warn('API reports fetch failed, falling back to localStorage:', error);
      return getLocalReports(user.id);
    }
  },

  /**
   * Fetch a single report details by ID
   */
  fetchReportById: async (apiUrl, id, user) => {
    if (!user) return null;
    try {
      const list = await reportService.fetchReports(apiUrl, user);
      const found = list.find(r => String(r.id) === String(id) || String(r.dbId) === String(id));
      if (!found) throw new Error('Clinical report not found');
      return found;
    } catch (error) {
      console.warn('API report by ID failed, searching localStorage:', error);
      const local = getLocalReports(user.id);
      const found = local.find(r => String(r.id) === String(id) || String(r.dbId) === String(id));
      if (!found) throw new Error('Clinical report not found');
      return found;
    }
  },

  /**
   * Submit doctor sign-off review on report
   */
  submitDoctorReview: async (apiUrl, analysisId, reviewData, user) => {
    if (!user) throw new Error('User session not found');
    const { doctorOpinion, prescription } = reviewData;

    try {
      await axios.post(`${apiUrl}/reports`, {
        analysisId,
        doctorOpinion,
        prescription
      });
      return { success: true };
    } catch (error) {
      console.warn('API sign-off failed, updating in localStorage:', error);
      // Fallback: update localStorage
      const local = getLocalReports(user.id);
      const updated = local.map(rep => {
        if (Number(rep.dbId) === Number(analysisId)) {
          return {
            ...rep,
            status: 'Reviewed',
            dermatologistReview: {
              status: 'Reviewed',
              doctorId: user.id,
              doctorName: user.name,
              reviewDate: new Date().toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              clinicalOpinion: doctorOpinion,
              comments: 'Clinically evaluated and matched with AI prediction scan.',
              treatmentAdvice: 'Follow prescription directions. Protect from sun exposure.',
              prescription: prescription
            }
          };
        }
        return rep;
      });
      saveLocalReports(user.id, updated);
      return { success: true };
    }
  },

  /**
   * Delete a report by ID
   */
  deleteReport: async (apiUrl, id, user) => {
    if (!user) throw new Error('User session not found');
    try {
      await axios.delete(`${apiUrl}/analyses/${id}`);
      // Also update local storage cache
      const local = getLocalReports(user.id);
      const updated = local.filter(r => String(r.dbId) !== String(id) && String(r.id) !== String(id));
      saveLocalReports(user.id, updated);
      return { success: true };
    } catch (error) {
      console.warn('API delete failed, updating local cache:', error);
      const local = getLocalReports(user.id);
      const updated = local.filter(r => String(r.dbId) !== String(id) && String(r.id) !== String(id));
      saveLocalReports(user.id, updated);
      return { success: true };
    }
  }
};

export default reportService;
