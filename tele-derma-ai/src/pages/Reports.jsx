import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { 
  FaSearch, 
  FaSort, 
  FaClock, 
  FaFileDownload, 
  FaEye, 
  FaClipboardList, 
  FaUserMd,
  FaRobot,
  FaTrash
} from 'react-icons/fa';
import reportService from '../services/reportService';
import { generateReportPDF } from '../utils/pdfGenerator';
import './Reports.css';

const Reports = () => {
  const { user, API_URL } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');

  const fetchReportsData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await reportService.fetchReports(API_URL, user);
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
      setErrorMsg('Something went wrong while loading your clinical reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReportsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL, user]);

  const handleDownload = async (e, report) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await generateReportPDF(report);
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  };

  const handleDelete = async (e, dbId) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmDelete = window.confirm('Are you sure you want to delete this clinical report? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      await reportService.deleteReport(API_URL, dbId, user);
      setReports(prev => prev.filter(r => r.dbId !== dbId));
      alert('Report deleted successfully.');
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('Failed to delete report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Clinical Reports...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="reports-error-state glass-card text-center fade-in">
        <FaClipboardList size={48} className="error-icon" />
        <h2>Unable to Load Reports</h2>
        <p>{errorMsg}</p>
        <button className="btn-primary" onClick={fetchReportsData}>
          Try Again
        </button>
      </div>
    );
  }

  // Calculate dynamic stats from actual reports dataset
  const totalReports = reports.length;
  const highRiskCount = reports.filter(r => r.riskLevel === 'High').length;
  const pendingCount = reports.filter(r => r.dermatologistReview?.status === 'Pending').length;
  const reviewedCount = reports.filter(r => r.dermatologistReview?.status === 'Reviewed').length;

  // Filter logic
  const filteredReports = reports.filter(report => {
    // 1. Search Query
    const search = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      report.id.toLowerCase().includes(search) ||
      report.predictedCondition.toLowerCase().includes(search) ||
      report.scanDate.toLowerCase().includes(search) ||
      (report.dermatologistReview?.doctorName && report.dermatologistReview.doctorName.toLowerCase().includes(search));

    if (!matchesSearch) return false;

    // 2. Active Filter Tab
    switch (activeFilter) {
      case 'High Risk':
        return report.riskLevel === 'High';
      case 'Moderate Risk':
        return report.riskLevel === 'Moderate';
      case 'Low Risk':
        return report.riskLevel === 'Low';
      case 'Pending Review':
        return report.dermatologistReview?.status === 'Pending';
      case 'Reviewed':
        return report.dermatologistReview?.status === 'Reviewed';
      case 'Completed':
        return report.status?.toLowerCase().includes('completed') || report.status?.toLowerCase().includes('review');
      case 'All':
      default:
        return true;
    }
  });

  // Sorting logic
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'Newest First') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'Oldest First') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'Highest Risk') {
      const riskVal = { 'High': 3, 'Moderate': 2, 'Low': 1 };
      return (riskVal[b.riskLevel] || 0) - (riskVal[a.riskLevel] || 0);
    }
    if (sortBy === 'Recently Reviewed') {
      if (a.dermatologistReview?.status === 'Reviewed' && b.dermatologistReview?.status === 'Reviewed') {
        return new Date(b.dermatologistReview.reviewDate) - new Date(a.dermatologistReview.reviewDate);
      }
      return (b.dermatologistReview?.status === 'Reviewed' ? 1 : 0) - (a.dermatologistReview?.status === 'Reviewed' ? 1 : 0);
    }
    return 0;
  });

  if (user?.role === 'doctor') {
    const pendingReviewsCount = reports.filter(r => r.status?.includes('Pending') || r.dermatologistReview?.status === 'Pending').length;
    const highRiskCount = reports.filter(r => r.riskLevel === 'High').length;
    const reviewedCount = reports.filter(r => r.status === 'Reviewed' || r.status === 'Dermatologist Reviewed').length;
    const totalCount = reports.length;

    // Filter and Sort reports dynamically
    const filteredDocReports = reports.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = q ? (
        r.patientName?.toLowerCase().includes(q) ||
        r.predictedCondition?.toLowerCase().includes(q) ||
        String(r.id).includes(q)
      ) : true;

      let matchesFilter = true;
      if (activeFilter === 'High Risk') matchesFilter = r.riskLevel === 'High';
      else if (activeFilter === 'Moderate Risk') matchesFilter = r.riskLevel === 'Moderate';
      else if (activeFilter === 'Low Risk') matchesFilter = r.riskLevel === 'Low';
      else if (activeFilter === 'Pending Review') matchesFilter = r.status?.includes('Pending') || r.dermatologistReview?.status === 'Pending';
      else if (activeFilter === 'Reviewed') matchesFilter = r.status === 'Reviewed' || r.status === 'Dermatologist Reviewed';

      return matchesQuery && matchesFilter;
    });

    const sortedDocReports = [...filteredDocReports].sort((a, b) => {
      if (sortBy === 'Newest First') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'Oldest First') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'Highest Risk') {
        const riskScore = { 'High': 3, 'Moderate': 2, 'Low': 1 };
        return (riskScore[b.riskLevel] || 0) - (riskScore[a.riskLevel] || 0);
      }
      return 0;
    });

    return (
      <div className="reports-page doctor-reports fade-in">
        <header className="page-header">
          <h1>Patient Clinical Reports</h1>
          <p>Review AI-assisted skin analysis reports submitted by your patients.</p>
        </header>

        {/* Doctor stats summary cards */}
        <div className="reports-dashboard-stats">
          <div className="stat-card glass-card">
            <span className="stat-value text-yellow">{pendingReviewsCount}</span>
            <span className="stat-label">Pending Reviews</span>
          </div>
          <div className="stat-card glass-card">
            <span className="stat-value text-green">{reviewedCount}</span>
            <span className="stat-label">Reviewed Today</span>
          </div>
          <div className="stat-card glass-card border-red">
            <span className="stat-value text-red">{highRiskCount}</span>
            <span className="stat-label">High Risk Reports</span>
          </div>
          <div className="stat-card glass-card">
            <span className="stat-value">{totalCount}</span>
            <span className="stat-label">Total Reports</span>
          </div>
        </div>

        {/* Controls Bar: Search, Filters & Sorting */}
        <div className="reports-controls-bar glass-card">
          <div className="search-box-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search patient or condition..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="sort-box-wrapper">
            <FaSort className="sort-icon" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="Newest First">Newest First</option>
              <option value="Oldest First">Oldest First</option>
              <option value="Highest Risk">Highest Risk</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs Row */}
        <div className="filter-tabs-row">
          {['All', 'High Risk', 'Moderate Risk', 'Low Risk', 'Pending Review', 'Reviewed'].map((tab) => (
            <button
              key={tab}
              className={`filter-tab-btn ${activeFilter === tab ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Reports Cards List */}
        <div className="reports-list-wrapper">
          {sortedDocReports.length === 0 ? (
            <div className="glass-card empty-state text-center" style={{ padding: '3.5rem' }}>
              <FaClipboardList size={48} className="empty-icon" />
              <h2>No Patient Reports Found</h2>
              <p>No screening reports match the selected filters.</p>
            </div>
          ) : (
            sortedDocReports.map((report) => (
              <div key={report.id} className="report-card-row glass-card">
                <div className="report-card-left">
                  <div className="report-card-badge">AI Scan Report #{report.id}</div>
                  <h3 className="prediction-title">
                    {report.predictedCondition} 
                    <span className={`risk-tag risk-${report.riskLevel?.toLowerCase()}`}>
                      ({report.riskLevel} Risk)
                    </span>
                  </h3>
                  
                  <div className="scan-meta-details">
                    <span>Patient: <strong>{report.patientName || 'Dama Ashwitha'}</strong></span>
                    <span>•</span>
                    <span>AI Confidence: <strong>{report.confidence?.toFixed(1)}%</strong></span>
                  </div>

                  <div className="scan-date-row">
                    <FaClock className="icon-dim" />
                    <span>Scan Date: {report.scanDate}</span>
                  </div>
                </div>

                <div className="report-card-right">
                  <div className="status-label-group">
                    <span>Status: 
                      <span className={`status-badge-text status-${report.status?.toLowerCase().replace(/ /g, '-')}`}>
                        {report.status}
                      </span>
                    </span>
                  </div>

                  <div className="card-actions-footer">
                    <Link to={`/reports/${report.id}`} className="btn-primary flex-center">
                      <FaEye />
                      <span>Review Report</span>
                    </Link>
                    <button className="btn-outline" onClick={(e) => handleDownload(e, report)}>
                      <FaFileDownload />
                      <span>Download PDF</span>
                    </button>
                    <button className="btn-danger-outline" onClick={(e) => handleDelete(e, report.dbId)}>
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page fade-in">
      <header className="page-header">
        <h1>Clinical Reports</h1>
        <p>Browse AI skin analysis reports, download clinical PDFs, and review dermatologist opinions.</p>
      </header>

      {/* Summary Dashboard Cards */}
      <div className="reports-dashboard-stats">
        <div className="stat-card glass-card">
          <span className="stat-value">{totalReports}</span>
          <span className="stat-label">Total Reports</span>
        </div>
        <div className="stat-card glass-card border-red">
          <span className="stat-value text-red">{highRiskCount}</span>
          <span className="stat-label">High Risk</span>
        </div>
        <div className="stat-card glass-card border-yellow">
          <span className="stat-value text-yellow">{pendingCount}</span>
          <span className="stat-label">Pending Review</span>
        </div>
        <div className="stat-card glass-card border-blue">
          <span className="stat-value text-blue">{reviewedCount}</span>
          <span className="stat-label">Reviewed</span>
        </div>
      </div>

      {/* Controls Bar: Search, Filters & Sorting */}
      <div className="reports-controls-bar glass-card">
        {/* Search */}
        <div className="search-box-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search reports by condition, ID, doctor..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sorting */}
        <div className="sort-box-wrapper">
          <FaSort className="sort-icon" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="Newest First">Newest First</option>
            <option value="Oldest First">Oldest First</option>
            <option value="Highest Risk">Highest Risk</option>
            <option value="Recently Reviewed">Recently Reviewed</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="filter-tabs-row">
        {['All', 'High Risk', 'Moderate Risk', 'Low Risk', 'Pending Review', 'Reviewed', 'Completed'].map((tab) => (
          <button
            key={tab}
            className={`filter-tab-btn ${activeFilter === tab ? 'active' : ''}`}
            onClick={() => setActiveFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reports List Cards Container */}
      <div className="reports-list-container">
        {sortedReports.length === 0 ? (
          <div className="glass-card empty-state text-center" style={{ padding: '3.5rem' }}>
            <FaRobot size={48} className="empty-icon" />
            <h2>No Clinical Reports Yet</h2>
            <p>Your completed AI skin analyses and dermatologist consultation opinions will appear here.</p>
            <Link to="/analysis" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
              Start AI Analysis &rarr;
            </Link>
          </div>
        ) : (
          sortedReports.map((report) => {
            return (
              <div key={report.id} className="report-card-row glass-card">
                
                {/* Left Side: AI Scan Summary */}
                <div className="report-card-left">
                  <div className="report-card-badge">AI Scan Report #{report.id}</div>
                  <h3 className="prediction-title">
                    {report.predictedCondition} 
                    <span className={`risk-tag risk-${report.riskLevel?.toLowerCase()}`}>
                      ({report.riskLevel} Risk)
                    </span>
                  </h3>
                  
                  <div className="scan-meta-metrics">
                    <span>Confidence: <strong>{report.confidence?.toFixed(1)}%</strong></span>
                    <span className="bullet-dot">•</span>
                    <span>Status: 
                      <span className={`status-badge-text status-${report.status?.toLowerCase().replace(/ /g, '-')}`}>
                        {report.status}
                      </span>
                    </span>
                  </div>

                  <div className="scan-date-row">
                    <FaClock className="icon-dim" />
                    <span>Scan Date: {report.scanDate}</span>
                  </div>

                  <div className="card-actions-footer">
                    <Link to={`/reports/${report.id}`} className="btn-primary flex-center">
                      <FaEye />
                      <span>View Full Report</span>
                    </Link>
                    <button className="btn-outline" onClick={(e) => handleDownload(e, report)}>
                      <FaFileDownload />
                      <span>Download PDF</span>
                    </button>
                    <button className="btn-danger-outline" onClick={(e) => handleDelete(e, report.dbId)}>
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Right Side: Specialist Review Status */}
                <div className="report-card-right">
                  <h4 className="right-panel-header">Dermatologist Review</h4>
                  {report.dermatologistReview?.status === 'Reviewed' ? (
                    <div className="doctor-status-inner reviewed-inner">
                      <FaUserMd className="doc-review-icon text-blue" />
                      <div className="review-notes">
                        <strong>Reviewed by {report.dermatologistReview.doctorName}</strong>
                        <p className="truncated-opinion">{report.dermatologistReview.clinicalOpinion}</p>
                        <span className="review-badge-small">Reviewed</span>
                      </div>
                    </div>
                  ) : (
                    <div className="doctor-status-inner pending-inner">
                      <FaClipboardList className="doc-review-icon text-yellow" />
                      <div className="review-notes">
                        <strong>Pending Review</strong>
                        <p>Your scan is queued. Specialist comments will appear once signed off.</p>
                        <span className="review-badge-small-yellow">Queued</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Reports;
