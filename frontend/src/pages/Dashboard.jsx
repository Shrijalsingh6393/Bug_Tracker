import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, Bug, Plus, Search, Filter, Calendar, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import BugModal from '../components/BugModal';
import TaskModal from '../components/TaskModal';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('bugs');
  const [bugs, setBugs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    severity: ''
  });

  // Modal States
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchUsers();
    if (activeTab === 'bugs') {
      fetchBugs();
    } else {
      fetchTasks();
    }
  }, [activeTab, filters]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchBugs = async () => {
    setIsLoading(true);
    try {
      const params = { ...filters };
      const response = await api.get('/bugs', { params });
      setBugs(response.data.data);
    } catch (error) {
      console.error('Failed to fetch bugs', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const params = { ...filters };
      const response = await api.get('/tasks', { params });
      setTasks(response.data.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedItem(null);
    if (activeTab === 'bugs') {
      setIsBugModalOpen(true);
    } else {
      setIsTaskModalOpen(true);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    if (activeTab === 'bugs') {
      setIsBugModalOpen(true);
    } else {
      setIsTaskModalOpen(true);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      reported: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      open: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return colors[status] || colors.reported;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-slate-400',
      medium: 'text-blue-400',
      high: 'text-orange-400',
      urgent: 'text-red-500'
    };
    return colors[priority] || colors.medium;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      minor: 'text-emerald-400',
      major: 'text-blue-400',
      critical: 'text-orange-400',
      blocker: 'text-red-500'
    };
    return colors[severity] || colors.major;
  };

  const filteredItems = (activeTab === 'bugs' ? bugs : tasks).filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 p-2 rounded-xl">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">BugTracker</span>
              </div>
              
              <div className="hidden md:flex items-center gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-700/50">
                <button 
                  onClick={() => setActiveTab('bugs')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'bugs' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Bugs
                </button>
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Tasks
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <span className="text-sm font-medium text-indigo-400">{user?.name?.charAt(0)}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white leading-none mb-0.5">{user?.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {activeTab === 'bugs' ? 'Bug Reports' : 'Project Tasks'}
            </h1>
            <p className="text-slate-400 text-sm">
              {activeTab === 'bugs' ? 'Manage and track software defects.' : 'Organize and assign development tasks.'}
            </p>
          </div>
          <button 
            onClick={handleCreateNew}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New {activeTab === 'bugs' ? 'Bug' : 'Task'}
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 mb-8 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`} 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-1.5">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                className="bg-transparent border-none text-xs font-medium text-slate-300 focus:ring-0 p-0 pr-6"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Statuses</option>
                {activeTab === 'bugs' ? (
                  <>
                    <option value="reported">Reported</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </>
                ) : (
                  <>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </>
                )}
              </select>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <select 
                className="bg-transparent border-none text-xs font-medium text-slate-300 focus:ring-0 p-0 pr-6"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {activeTab === 'bugs' && (
              <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-1.5">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <select 
                  className="bg-transparent border-none text-xs font-medium text-slate-300 focus:ring-0 p-0 pr-6"
                  value={filters.severity}
                  onChange={(e) => setFilters({...filters, severity: e.target.value})}
                >
                  <option value="">All Severities</option>
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                  <option value="blocker">Blocker</option>
                </select>
              </div>
            )}

            <button 
              onClick={() => setFilters({status: '', priority: '', severity: ''})}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors px-2"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* List Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-3xl border border-slate-700/30">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-400 text-sm">Loading {activeTab}...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-700/50 border-dashed">
            <div className="bg-slate-700/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {activeTab === 'bugs' ? <Bug className="w-8 h-8 text-slate-500" /> : <CheckSquare className="w-8 h-8 text-slate-500" />}
            </div>
            <h3 className="text-lg font-medium text-white mb-1">No {activeTab} found</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleEdit(item)}
                className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-slate-800 transition-all group cursor-pointer shadow-sm hover:shadow-indigo-500/5"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-slate-500 border border-slate-700">
                        {activeTab === 'bugs' ? 'BUG' : 'TSK'}-{item.id}
                      </span>
                      <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                          {item.reporter?.name?.charAt(0)}
                        </div>
                        {item.reporter?.name}
                      </div>
                      
                      <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                      
                      <div className={`flex items-center gap-1.5 ${getPriorityColor(item.priority)}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {item.priority.toUpperCase()}
                      </div>

                      {activeTab === 'bugs' && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                          <div className={`flex items-center gap-1.5 ${getSeverityColor(item.severity)}`}>
                            <AlertCircle className="w-3.5 h-3.5" />
                            {item.severity.toUpperCase()}
                          </div>
                        </>
                      )}

                      {activeTab === 'tasks' && item.deadline && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            Due {new Date(item.deadline).toLocaleDateString()}
                          </div>
                        </>
                      )}

                      {item.assignee && (
                        <>
                          <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                          <div className="flex items-center gap-1.5 text-indigo-400">
                            <CheckSquare className="w-3.5 h-3.5" />
                            Assigned to {item.assignee.name}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <BugModal 
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        bug={selectedItem}
        onSave={fetchBugs}
        users={users}
      />
      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedItem}
        onSave={fetchTasks}
        users={users}
      />
    </div>
  );
}
