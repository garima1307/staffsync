import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from '../redux/slices/employeeSlice';
import Modal from '../components/Modal';
import { Users, Plus, Search, Trash2, Edit2, Phone, Mail, Building, Briefcase } from 'lucide-react';

const Employees = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { employees, isLoading } = useSelector((state) => state.employees);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    phone: '',
    salary: 60000,
    employmentType: 'Full-Time',
  });

  const isHR = user?.role === 'hr';

  useEffect(() => {
    dispatch(fetchEmployees({ search, department }));
  }, [dispatch, search, department]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createEmployee(formData));
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      phone: '',
      salary: 60000,
      employmentType: 'Full-Time',
    });
    dispatch(fetchEmployees({ search, department }));
  };

  const openEdit = (emp) => {
    setCurrentEmployee(emp);
    setFormData({
      name: emp.user?.name || '',
      email: emp.user?.email || '',
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      phone: emp.user?.phone || '',
      salary: emp.salary || 50000,
      employmentType: emp.employmentType || 'Full-Time',
      status: emp.status || 'Active',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (currentEmployee) {
      await dispatch(updateEmployee({ id: currentEmployee._id, data: formData }));
      setIsEditModalOpen(false);
      dispatch(fetchEmployees({ search, department }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      await dispatch(deleteEmployee(id));
      dispatch(fetchEmployees({ search, department }));
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            {isHR ? 'Employee Directory & Management' : 'My Team Members'}
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            {isHR ? 'Manage staff records, roles, and organizational assignments' : 'Supervise your department team roster'}
          </p>
        </div>

        {isHR && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={18} /> Add New Employee
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--slate-400)' }} />
            <input
              type="text"
              placeholder="Search by name, email or role..."
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '200px' }}>
            <select
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department & Role</th>
                <th>ID & Contact</th>
                <th>Type / Status</th>
                {isHR && <th>Salary</th>}
                {isHR && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={isHR ? 6 : 4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                    No employee records found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {emp.user?.name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                            {emp.user?.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} /> {emp.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{emp.designation}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={12} /> {emp.department}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{emp.employeeId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {emp.user?.phone || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ marginRight: '6px' }}>
                        {emp.status}
                      </span>
                      <span className="badge badge-gray">{emp.employmentType}</span>
                    </td>
                    {isHR && (
                      <td style={{ fontWeight: 600, color: 'var(--slate-800)' }}>
                        ${emp.salary?.toLocaleString()}
                      </td>
                    )}
                    {isHR && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openEdit(emp)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Employee"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id)}
                            className="btn btn-danger btn-sm"
                            title="Deactivate Employee"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <input
              type="email"
              name="email"
              required
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                name="designation"
                required
                className="form-control"
                value={formData.designation}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Annual Salary ($)</label>
              <input
                type="number"
                name="salary"
                className="form-control"
                value={formData.salary}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select
                name="employmentType"
                className="form-control"
                value={formData.employmentType}
                onChange={handleInputChange}
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Employee Profile">
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                name="designation"
                required
                className="form-control"
                value={formData.designation}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Salary ($)</label>
              <input
                type="number"
                name="salary"
                className="form-control"
                value={formData.salary}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="On-Leave">On-Leave</option>
                <option value="Resigned">Resigned</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
