import axios from 'axios';

// Local storage helpers
const getLocalAppointments = (userId) => {
  const data = localStorage.getItem(`tele_derma_appointments_${userId}`);
  return data ? JSON.parse(data) : [];
};

const saveLocalAppointments = (userId, appts) => {
  localStorage.setItem(`tele_derma_appointments_${userId}`, JSON.stringify(appts));
};

const appointmentService = {
  /**
   * Fetch all appointments for a user (either patient or doctor)
   */
  fetchAppointments: async (apiUrl, user) => {
    if (!user) return [];
    try {
      const response = await axios.get(`${apiUrl}/appointments`);
      // Update local storage cache to keep them synced
      saveLocalAppointments(user.id, response.data);
      return response.data;
    } catch (error) {
      console.warn('API fetch failed, falling back to localStorage:', error);
      return getLocalAppointments(user.id);
    }
  },

  /**
   * Fetch a single appointment details
   */
  fetchAppointmentById: async (apiUrl, id, user) => {
    if (!user) return null;
    try {
      const response = await axios.get(`${apiUrl}/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API fetch by ID failed, searching localStorage:', error);
      const local = getLocalAppointments(user.id);
      // Try string and number comparison
      const found = local.find(appt => String(appt.id) === String(id));
      if (!found) throw new Error('Appointment not found');
      return found;
    }
  },

  /**
   * Book a new dermatologist appointment
   */
  bookAppointment: async (apiUrl, apptData, user, doctorsList = []) => {
    if (!user) throw new Error('User session not found');
    const { doctorId, date, time, symptoms } = apptData;

    // Client-side slot conflict validation
    const available = await appointmentService.checkSlotAvailability(apiUrl, doctorId, date, time, user);
    if (!available) {
      throw new Error('This time slot is already booked. Please select another time.');
    }

    const docInfo = doctorsList.find(d => Number(d.id) === Number(doctorId));
    const doctorName = docInfo ? docInfo.name : 'Unknown Dermatologist';
    const specialization = docInfo ? docInfo.specialty : 'Dermatologist';
    const experience = docInfo ? docInfo.experience_years : 0;
    const consultationType = docInfo ? docInfo.consultation_type : 'Consultation';
    const rating = docInfo ? docInfo.rating : 5.0;

    try {
      const response = await axios.post(`${apiUrl}/appointments`, {
        doctorId,
        date,
        time,
        symptoms
      });
      return {
        success: true,
        appointmentId: response.data.appointmentId,
        message: 'Appointment Confirmed Successfully!'
      };
    } catch (error) {
      console.warn('API booking failed, saving to localStorage:', error);
      if (error.response?.data?.message && error.response.status === 400) {
        // Enforce the backend's validation message if it returned one
        throw new Error(error.response.data.message);
      }
      
      // Fallback: Save locally
      const local = getLocalAppointments(user.id);
      const newId = `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newAppt = {
        id: newId,
        patientId: user.id,
        doctorId: Number(doctorId),
        doctorName,
        specialization,
        experience,
        consultationType,
        rating,
        date,
        time,
        symptoms,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      local.push(newAppt);
      saveLocalAppointments(user.id, local);

      return {
        success: true,
        appointmentId: newId,
        message: 'Appointment Confirmed Successfully!'
      };
    }
  },

  /**
   * Reschedule an appointment
   */
  rescheduleAppointment: async (apiUrl, id, newDate, newTime, user) => {
    if (!user) throw new Error('User session not found');

    // Get current appointment to identify the doctor
    const current = await appointmentService.fetchAppointmentById(apiUrl, id, user);
    if (!current) throw new Error('Appointment not found');

    // Validate slot availability
    const available = await appointmentService.checkSlotAvailability(apiUrl, current.doctorId, newDate, newTime, user, id);
    if (!available) {
      throw new Error('This time slot is already booked. Please select another time.');
    }

    try {
      await axios.put(`${apiUrl}/appointments/${id}`, {
        date: newDate,
        time: newTime
      });
      return { success: true };
    } catch (error) {
      console.warn('API rescheduling failed, updating in localStorage:', error);
      if (error.response?.data?.message && error.response.status === 400) {
        throw new Error(error.response.data.message);
      }

      const local = getLocalAppointments(user.id);
      const updated = local.map(appt => {
        if (String(appt.id) === String(id)) {
          return {
            ...appt,
            date: newDate,
            time: newTime,
            status: 'confirmed' // Sets status to rescheduled/confirmed
          };
        }
        return appt;
      });
      
      saveLocalAppointments(user.id, updated);
      return { success: true };
    }
  },

  /**
   * Cancel an appointment
   */
  cancelAppointment: async (apiUrl, id, user) => {
    if (!user) throw new Error('User session not found');
    try {
      await axios.put(`${apiUrl}/appointments/${id}/cancel`);
      return { success: true };
    } catch (error) {
      console.warn('API cancellation failed, updating in localStorage:', error);
      
      const local = getLocalAppointments(user.id);
      const updated = local.map(appt => {
        if (String(appt.id) === String(id)) {
          return {
            ...appt,
            status: 'cancelled'
          };
        }
        return appt;
      });

      saveLocalAppointments(user.id, updated);
      return { success: true };
    }
  },

  /**
   * Check if a doctor has any other active appointment booked at the same date and time
   */
  checkSlotAvailability: async (apiUrl, doctorId, date, time, user, currentApptId = null) => {
    try {
      // Load all appointments to check conflict
      const list = await appointmentService.fetchAppointments(apiUrl, user);
      
      const conflict = list.find(appt => 
        Number(appt.doctorId) === Number(doctorId) && 
        appt.date === date && 
        appt.time === time && 
        String(appt.id) !== String(currentApptId) &&
        appt.status !== 'cancelled'
      );
      
      return !conflict;
    } catch (error) {
      console.error('Error verifying slot availability:', error);
      return true; // Fallback to allowing in case of error
    }
  }
};

export default appointmentService;
