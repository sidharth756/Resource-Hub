import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { calendarAPI } from '../../services/api';
import { 
  Calendar as CalendarIcon, Plus, Clock, MapPin, User, ChevronLeft, ChevronRight,
  Filter, Search, Edit, Trash2, Eye, X
} from 'lucide-react';

const Calendar = () => {
  const { isAdmin, isFaculty } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // month, list
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventType: 'other',
    location: '',
    time: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const eventTypes = [
    { value: 'exam', label: 'Exam', color: '#dc3545', icon: '📝' },
    { value: 'holiday', label: 'Holiday', color: '#28a745', icon: '🏖️' },
    { value: 'event', label: 'Event', color: '#007bff', icon: '🎉' },
    { value: 'deadline', label: 'Deadline', color: '#ffc107', icon: '⏰' },
    { value: 'meeting', label: 'Meeting', color: '#6f42c1', icon: '👥' },
    { value: 'workshop', label: 'Workshop', color: '#20c997', icon: '🛠️' },
    { value: 'other', label: 'Other', color: '#6c757d', icon: '📌' }
  ];

  useEffect(() => {
    fetchEvents();
  }, [currentDate, filterType, searchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await calendarAPI.getEvents({
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    
    try {
      await calendarAPI.addEvent(newEvent);
      setSuccess('Event added successfully!');
      setNewEvent({
        title: '',
        description: '',
        eventDate: '',
        eventType: 'other',
        location: '',
        time: ''
      });
      setShowAddForm(false);
      fetchEvents();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to add event');
      console.error('Error adding event:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.event_type === filterType;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date?.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date?.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="full-width-container">
      <div className="content-container">
        {/* Header Section */}
        <div className="calendar-header-neat">
          <div className="calendar-title-section">
            <h1 className="calendar-title">Academic Calendar</h1>
            <p className="calendar-subtitle">Stay organized with important academic dates and events</p>
          </div>
          
          <div className="calendar-header-actions">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                <CalendarIcon size={18} />
                Month
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <Eye size={18} />
                List
              </button>
            </div>
            
            {(isAdmin || isFaculty) && (
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-add-event"
              >
                <Plus size={18} />
                Add Event
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert-neat error">
            {error}
            <button onClick={() => setError('')} className="alert-close">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="alert-neat success">
            {success}
            <button onClick={() => setSuccess('')} className="alert-close">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="calendar-controls-neat">
          <div className="search-section">
            <div className="search-input-wrapper">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          <div className="filter-section">
            <Filter size={18} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Events</option>
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Content */}
        {viewMode === 'month' ? (
          <div className="calendar-view-neat">
            {/* Month Navigation */}
            <div className="month-navigation">
              <button onClick={() => navigateMonth(-1)} className="nav-btn">
                <ChevronLeft size={20} />
              </button>
              <h2 className="current-month">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => navigateMonth(1)} className="nav-btn">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {/* Weekday Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday-header">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {getDaysInMonth(currentDate).map((date, index) => (
                <div
                  key={index}
                  className={`calendar-day ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${isSelected(date) ? 'selected' : ''}`}
                  onClick={() => date && setSelectedDate(date)}
                >
                  {date && (
                    <>
                      <span className="day-number">{date.getDate()}</span>
                      <div className="day-events">
                        {getEventsForDate(date).slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className="day-event-dot"
                            style={{ backgroundColor: eventTypes.find(t => t.value === event.event_type)?.color }}
                            title={event.title}
                          />
                        ))}
                        {getEventsForDate(date).length > 3 && (
                          <span className="more-events">+{getEventsForDate(date).length - 3}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Selected Date Events */}
            {selectedDate && (
              <div className="selected-date-events">
                <h3 className="selected-date-title">
                  Events for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="no-events-message">No events scheduled for this date</p>
                ) : (
                  <div className="date-events-list">
                    {getEventsForDate(selectedDate).map(event => (
                      <div key={event.id} className="event-item-neat">
                        <div className="event-indicator" style={{ backgroundColor: eventTypes.find(t => t.value === event.event_type)?.color }}>
                          {eventTypes.find(t => t.value === event.event_type)?.icon}
                        </div>
                        <div className="event-details">
                          <h4 className="event-title">{event.title}</h4>
                          {event.description && <p className="event-description">{event.description}</p>}
                          {event.time && (
                            <div className="event-meta">
                              <Clock size={14} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="event-meta">
                              <MapPin size={14} />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // List View
          <div className="list-view-neat">
            <h2 className="list-title">Upcoming Events</h2>
            
            {filteredEvents.length === 0 ? (
              <div className="no-events-neat">
                <CalendarIcon size={64} />
                <h3>No events found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="events-list-neat">
                {filteredEvents
                  .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                  .map(event => (
                    <div key={event.id} className="event-card-neat">
                      <div className="event-date-badge">
                        <span className="event-month">
                          {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="event-day">
                          {new Date(event.event_date).getDate()}
                        </span>
                      </div>
                      
                      <div className="event-content-neat">
                        <div className="event-header-neat">
                          <h3 className="event-title-neat">{event.title}</h3>
                          <div 
                            className="event-type-badge"
                            style={{ backgroundColor: eventTypes.find(t => t.value === event.event_type)?.color }}
                          >
                            {eventTypes.find(t => t.value === event.event_type)?.icon}
                            {eventTypes.find(t => t.value === event.event_type)?.label}
                          </div>
                        </div>
                        
                        {event.description && (
                          <p className="event-description-neat">{event.description}</p>
                        )}
                        
                        <div className="event-meta-neat">
                          <div className="meta-item">
                            <Clock size={16} />
                            <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </div>
                          {event.time && (
                            <div className="meta-item">
                              <Clock size={16} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="meta-item">
                              <MapPin size={16} />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {(isAdmin || isFaculty) && (
                        <div className="event-actions-neat">
                          <button className="action-btn edit">
                            <Edit size={16} />
                          </button>
                          <button className="action-btn delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Add Event Modal */}
        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content-neat">
              <div className="modal-header">
                <h3>Add New Event</h3>
                <button onClick={() => setShowAddForm(false)} className="modal-close">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddEvent} className="event-form-neat">
                <div className="form-row-neat">
                  <div className="form-group-neat">
                    <label className="form-label-neat">Event Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="form-input-neat"
                      placeholder="Enter event title"
                      required
                    />
                  </div>
                  
                  <div className="form-group-neat">
                    <label className="form-label-neat">Event Type</label>
                    <select
                      value={newEvent.eventType}
                      onChange={(e) => setNewEvent({...newEvent, eventType: e.target.value})}
                      className="form-select-neat"
                    >
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group-neat">
                  <label className="form-label-neat">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="form-textarea-neat"
                    placeholder="Event description (optional)"
                    rows="3"
                  />
                </div>

                <div className="form-row-neat">
                  <div className="form-group-neat">
                    <label className="form-label-neat">Date</label>
                    <input
                      type="date"
                      value={newEvent.eventDate}
                      onChange={(e) => setNewEvent({...newEvent, eventDate: e.target.value})}
                      className="form-input-neat"
                      required
                    />
                  </div>
                  
                  <div className="form-group-neat">
                    <label className="form-label-neat">Time (Optional)</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="form-input-neat"
                    />
                  </div>
                </div>

                <div className="form-group-neat">
                  <label className="form-label-neat">Location (Optional)</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="form-input-neat"
                    placeholder="Event location"
                  />
                </div>

                <div className="form-actions-neat">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-cancel-neat"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit-neat">
                    <Plus size={16} />
                    Add Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;