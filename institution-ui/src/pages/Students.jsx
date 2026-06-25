import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Eye,
  FileSpreadsheet,
  Download,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserMinus,
  Mail,
  Phone,
  FileText
} from 'lucide-react';

const studentSchema = zod.object({
  firstName: zod.string().min(2, 'First Name is required'),
  lastName: zod.string().min(2, 'Last Name is required'),
  otherName: zod.string().optional(),
  matricNumber: zod.string().min(5, 'Matric Number is required'),
  department: zod.string().min(2, 'Department is required'),
  faculty: zod.string().min(2, 'Faculty is required'),
  level: zod.string().min(2, 'Level is required'),
  phone: zod.string().min(8, 'Phone Number is required'),
  email: zod.string().email('Please enter a valid email address'),
  gender: zod.enum(['male', 'female', 'Male', 'Female']),
  dateOfBirth: zod.string().min(10, 'Date of Birth is required'),
  passportPhoto: zod.string().optional()
});

export const Students = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: 'Male',
      level: '400 Level'
    }
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.students.list({ search: searchQuery, department: filterDept, level: filterLevel, status: filterStatus });
      // Backend returns { students, pagination } or just array
      setStudents(Array.isArray(data) ? data : (data.students || []));
    } catch (err) {
      showToast(err.message || 'Failed to fetch student registry', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const handleCreateSubmit = async (formData) => {
    try {
      // Map form field to backend field name
      const payload = { ...formData, gender: formData.gender?.toLowerCase() };
      if (isEditing && selectedStudent) {
        const studentId = selectedStudent._id || selectedStudent.id;
        await api.students.update(studentId, payload);
        showToast('Student record updated successfully', 'success');
        setIsCreateOpen(false);
        fetchStudents();
      } else {
        const result = await api.students.create(payload);
        // Backend returns { student, credentials: { username, temporaryPassword } }
        const creds = result.credentials || {};
        const student = result.student || result;
        setGeneratedCreds({
          name: `${student.firstName} ${student.lastName}`,
          username: creds.username || student.username,
          password: creds.temporaryPassword || 'See email',
          matric: student.matricNumber
        });
        showToast('Student registered successfully!', 'success');
        setIsCreateOpen(false);
        fetchStudents();
      }
    } catch (err) {
      showToast(err.message || 'Process failed.', 'error');
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsEditing(true);
    setIsCreateOpen(true);
    // populate fields
    setValue('firstName', student.firstName);
    setValue('lastName', student.lastName);
    setValue('otherName', student.otherName);
    setValue('matricNumber', student.matricNumber);
    setValue('department', student.department);
    setValue('faculty', student.faculty);
    setValue('level', student.level);
    setValue('phone', student.phone);
    setValue('email', student.email);
    setValue('gender', student.gender);
    setValue('dateOfBirth', student.dateOfBirth);
    setValue('passportPhoto', student.passportPhoto);
  };

  const handleDelete = async (student) => {
    const studentId = student._id || student.id;
    if (window.confirm('Are you sure you want to permanently delete this student record?')) {
      try {
        // Note: backend may not have a delete endpoint — using updateStatus to suspend instead
        await api.students.updateStatus(studentId, 'suspended');
        showToast('Student suspended successfully', 'success');
        fetchStudents();
      } catch (err) {
        showToast(err.message || 'Action failed', 'error');
      }
    }
  };

  const handleToggleSuspend = async (student) => {
    const studentId = student._id || student.id;
    try {
      if (student.status === 'active') {
        await api.students.updateStatus(studentId, 'suspended');
        showToast('Student account suspended', 'warning');
      } else {
        await api.students.updateStatus(studentId, 'active');
        showToast('Student account activated', 'success');
      }
      fetchStudents();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const copyCreds = () => {
    const text = `Student Account Credentials:\nName: ${generatedCreds.name}\nMatric: ${generatedCreds.matric}\nUsername: ${generatedCreds.username}\nPassword: ${generatedCreds.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Credentials copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Export Simulated Tools
  const exportCSV = () => {
    let csv = 'Matric,First Name,Last Name,Department,Level,Gender,Email,Status\n';
    students.forEach(s => {
      csv += `"${s.matricNumber}","${s.firstName}","${s.lastName}","${s.department}","${s.level}","${s.gender}","${s.email}","${s.status}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'student_registry_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Student CSV export triggered', 'success');
  };

  const exportExcel = () => {
    // In pure frontend simulation, we trigger another download labeled Excel (TSV with XLS extension is readable by Excel)
    let xls = 'Matric\tFirst Name\tLast Name\tDepartment\tLevel\tGender\tEmail\tStatus\n';
    students.forEach(s => {
      xls += `${s.matricNumber}\t${s.firstName}\t${s.lastName}\t${s.department}\t${s.level}\t${s.gender}\t${s.email}\t${s.status}\n`;
    });
    const blob = new Blob([xls], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'student_registry_report.xls');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Student Excel export triggered', 'success');
  };

  // Filter & Search Logic
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.matricNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesDept = filterDept ? s.department.toLowerCase() === filterDept.toLowerCase() : true;
    const matchesLevel = filterLevel ? s.level.toLowerCase() === filterLevel.toLowerCase() : true;
    const matchesStatus = filterStatus ? s.status.toLowerCase() === filterStatus.toLowerCase() : true;

    return matchesSearch && matchesDept && matchesLevel && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Title */}
      <div className="flex items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-black m-0 tracking-wide">Students</h1>
          <p className="text-sm font-bold text-gray-500 uppercase mt-1">Enroll, edit, audit, and generate scan credentials for students.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsEditing(false);
              reset();
              setIsCreateOpen(true);
            }}
            className="flat-btn bg-flatBlue text-white hover:scale-102 flex items-center gap-2 py-3"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            Add Student
          </button>
        </div>
      </div>

      {/* Generated Credentials Alert Banner */}
      {generatedCreds && (
        <div className="flat-card bg-flatEmerald text-black border-black relative">
          <button 
            onClick={() => setGeneratedCreds(null)} 
            className="absolute top-4 right-4 flat-border-sm p-1 bg-white cursor-pointer"
          >
            <X className="w-4 h-4 text-black" />
          </button>
          
          <h3 className="font-black uppercase text-lg mb-2 flex items-center gap-2">
            <UserCheck className="w-6 h-6 stroke-[2.5]" />
            Student Account Successfully Generated!
          </h3>
          <p className="text-xs font-extrabold uppercase text-green-900 mb-4">
            Provide the credentials below to the student. They will log in using these details on the Student UI Portal.
          </p>

          <div className="flat-border bg-white p-4 max-w-md divide-y-2 divide-black">
            <div className="py-2 flex justify-between text-xs"><span className="font-extrabold uppercase">Name</span><span className="font-black text-flatBlue">{generatedCreds.name}</span></div>
            <div className="py-2 flex justify-between text-xs"><span className="font-extrabold uppercase">Matric Number</span><span className="font-black">{generatedCreds.matric}</span></div>
            <div className="py-2 flex justify-between text-xs"><span className="font-extrabold uppercase">Login Username</span><span className="font-black font-mono">{generatedCreds.username}</span></div>
            <div className="py-2 flex justify-between text-xs"><span className="font-extrabold uppercase">Temp Password</span><span className="font-black font-mono text-red-600">{generatedCreds.password}</span></div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={copyCreds}
              className="flat-btn bg-white text-black hover:scale-102 flex items-center gap-1.5 py-2 px-4 text-xs font-black uppercase"
            >
              {copied ? <Check className="w-4 h-4 text-flatEmerald" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Credentials'}
            </button>
            <button
              onClick={() => setGeneratedCreds(null)}
              className="flat-btn bg-black text-white hover:scale-102 py-2 px-4 text-xs font-black uppercase"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters Block */}
      <div className="flat-card bg-white grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <input
            type="text"
            placeholder="Search by Name or Matric Number..."
            className="flat-input pl-11 py-2 text-sm"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Dept Filter */}
        <select
          className="flat-select py-2 text-sm bg-no-repeat bg-[right_16px_center]"
          value={filterDept}
          onChange={(e) => {
            setFilterDept(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Statistics">Statistics</option>
          <option value="Physics">Physics</option>
        </select>

        {/* Status Filter */}
        <select
          className="flat-select py-2 text-sm"
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Export & Actions Info */}
      <div className="flex justify-between items-center gap-4">
        <p className="text-xs font-black uppercase text-gray-500">
          Showing {paginatedStudents.length} of {filteredStudents.length} Students registered
        </p>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flat-btn bg-white hover:scale-105 py-2 px-4 text-xs font-black flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={exportExcel}
            className="flat-btn bg-white hover:scale-105 py-2 px-4 text-xs font-black flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-flatEmerald" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Student Table */}
      {loading ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <div className="w-10 h-10 border-4 border-t-flatBlue border-black rounded-full animate-spin mx-auto mb-4" />
          <p className="font-extrabold text-sm uppercase text-gray-500">Loading Student Database...</p>
        </div>
      ) : paginatedStudents.length === 0 ? (
        <div className="flat-card bg-white p-12 text-center border-black">
          <UserMinus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-black uppercase text-black">No Students Found</h3>
          <p className="text-xs font-bold text-gray-500 uppercase mt-1">Try adjusting search query or filters.</p>
        </div>
      ) : (
        <div className="flat-card bg-white p-0 border-black overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-black text-white uppercase text-xs tracking-wider border-b-4 border-black">
                <th className="p-4 font-black">Photo</th>
                <th className="p-4 font-black">Matric Number</th>
                <th className="p-4 font-black">Student Name</th>
                <th className="p-4 font-black">Department</th>
                <th className="p-4 font-black">Level</th>
                <th className="p-4 font-black">Status</th>
                <th className="p-4 font-black text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {paginatedStudents.map((student) => (
                <tr key={student._id || student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    {student.passportPhoto ? (
                      <img
                        src={student.passportPhoto.startsWith('/uploads') ? `http://localhost:5000${student.passportPhoto}` : student.passportPhoto}
                        alt="Student"
                        className="w-10 h-10 border-2 border-black object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 border-2 border-black bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
                        {student.firstName?.[0]}{student.lastName?.[0]}
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-black text-sm text-flatBlue">{student.matricNumber}</td>
                  <td className="p-4 font-black text-sm text-black">
                    {student.lastName}, {student.firstName}
                  </td>
                  <td className="p-4 font-bold text-xs uppercase text-gray-700">{student.department}</td>
                  <td className="p-4 font-extrabold text-xs text-black">{student.level}</td>
                  <td className="p-4">
                    <span
                      className={`flat-badge border-2 ${
                        student.status === 'active'
                          ? 'bg-flatEmerald text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {student.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openViewModal(student)}
                        className="flat-border-sm p-1.5 bg-white hover:bg-gray-100 text-black transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(student)}
                        className="flat-border-sm p-1.5 bg-white hover:bg-flatBlue hover:text-white text-black transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleSuspend(student)}
                        className={`flat-border-sm p-1.5 bg-white transition-colors cursor-pointer ${
                          student.status === 'active'
                            ? 'hover:bg-flatAmber text-black'
                            : 'hover:bg-flatEmerald hover:text-white text-black'
                        }`}
                        title={student.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        {student.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="flat-border-sm p-1.5 bg-white hover:bg-red-500 hover:text-white text-black transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t-4 border-black bg-gray-50 flex items-center justify-between gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flat-border-sm px-3 py-1.5 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none font-bold text-xs uppercase flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex gap-1.5">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`flat-border-sm px-3 py-1.5 font-black text-xs cursor-pointer ${
                      currentPage === idx + 1 ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flat-border-sm px-3 py-1.5 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none font-bold text-xs uppercase flex items-center gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="flat-card bg-white max-w-2xl w-full border-black max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 flat-border-sm p-1 bg-white hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5 text-black" />
            </button>

            <h3 className="text-xl font-black uppercase border-b-4 border-black pb-3 mb-6 text-black">
              {isEditing ? 'Edit Student Details' : 'Enroll New Student'}
            </h3>

            <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">First Name</label>
                  <input type="text" className="flat-input text-sm py-2" placeholder="Jane" {...register('firstName')} />
                  {errors.firstName && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.firstName.message}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Last Name</label>
                  <input type="text" className="flat-input text-sm py-2" placeholder="Doe" {...register('lastName')} />
                  {errors.lastName && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.lastName.message}</p>}
                </div>

                {/* Other Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Other Name</label>
                  <input type="text" className="flat-input text-sm py-2" placeholder="Mary (Optional)" {...register('otherName')} />
                </div>

                {/* Matric Number */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Matric Number</label>
                  <input type="text" className="flat-input text-sm py-2" placeholder="U2018/302001" {...register('matricNumber')} disabled={isEditing} />
                  {errors.matricNumber && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.matricNumber.message}</p>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Department</label>
                  <input type="text" className="flat-input text-sm py-2" placeholder="Computer Science" {...register('department')} />
                  {errors.department && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.department.message}</p>}
                </div>

                {/* Faculty */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Faculty</label>
                  <input type="text" className="flat-input text-sm py-2" placeholder="Science" {...register('faculty')} />
                  {errors.faculty && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.faculty.message}</p>}
                </div>

                {/* Level */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Academic Level</label>
                  <select className="flat-select text-sm py-2" {...register('level')}>
                    <option value="100 Level">100 Level</option>
                    <option value="200 Level">200 Level</option>
                    <option value="300 Level">300 Level</option>
                    <option value="400 Level">400 Level</option>
                    <option value="500 Level">500 Level</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Phone Number</label>
                  <input type="text" className="flat-input text-sm py-2" placeholder="+234..." {...register('phone')} />
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.phone.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Email Address</label>
                  <input type="email" className="flat-input text-sm py-2" placeholder="jane@apex.edu" {...register('email')} />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.email.message}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Gender</label>
                  <select className="flat-select text-sm py-2" {...register('gender')}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Date of Birth</label>
                  <input type="date" className="flat-input text-sm py-2" {...register('dateOfBirth')} />
                  {errors.dateOfBirth && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{errors.dateOfBirth.message}</p>}
                </div>

                {/* Passport Photo URL */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-1.5 text-black">Passport Photo URL</label>
                  <input type="text" className="flat-input text-sm py-2" placeholder="https://images.unsplash.com/..." {...register('passportPhoto')} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-4 border-black">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flat-btn bg-white hover:bg-gray-100 py-2 px-6 text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flat-btn bg-flatBlue text-white hover:scale-102 py-2 px-6 text-xs uppercase"
                >
                  {isEditing ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="flat-card bg-white max-w-md w-full border-black relative">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute top-4 right-4 flat-border-sm p-1 bg-white hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5 text-black" />
            </button>

            <h3 className="text-xl font-black uppercase border-b-4 border-black pb-3 mb-6 text-black flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-flatBlue" />
              Student Profile
            </h3>

            <div className="flex flex-col items-center mb-6">
              <img
                src={selectedStudent.passportPhoto}
                alt="Student Passport"
                className="w-28 h-28 border-4 border-black object-cover mb-3"
              />
              <h2 className="text-xl font-black text-black">
                {selectedStudent.lastName}, {selectedStudent.firstName} {selectedStudent.otherName}
              </h2>
              <span className="flat-badge bg-gray-100 border-black text-black font-black uppercase text-xs py-1 px-3 mt-1">
                {selectedStudent.matricNumber}
              </span>
            </div>

            <div className="space-y-3 font-semibold text-xs border-y-4 border-black py-4">
              <div className="flex justify-between"><span className="uppercase text-gray-500 font-black">Department</span><span className="font-extrabold text-black">{selectedStudent.department}</span></div>
              <div className="flex justify-between"><span className="uppercase text-gray-500 font-black">Faculty</span><span className="font-extrabold text-black">{selectedStudent.faculty}</span></div>
              <div className="flex justify-between"><span className="uppercase text-gray-500 font-black">Academic Level</span><span className="font-extrabold text-black">{selectedStudent.level}</span></div>
              <div className="flex justify-between"><span className="uppercase text-gray-500 font-black">Gender</span><span className="font-extrabold text-black">{selectedStudent.gender}</span></div>
              <div className="flex justify-between"><span className="uppercase text-gray-500 font-black">Date of Birth</span><span className="font-extrabold text-black">{selectedStudent.dateOfBirth}</span></div>
              <div className="flex justify-between items-center"><span className="uppercase text-gray-500 font-black">Phone</span><span className="font-extrabold text-black flex items-center gap-1"><Phone className="w-3 h-3" />{selectedStudent.phone}</span></div>
              <div className="flex justify-between items-center"><span className="uppercase text-gray-500 font-black">Email</span><span className="font-extrabold text-black flex items-center gap-1"><Mail className="w-3 h-3" />{selectedStudent.email}</span></div>
              <div className="flex justify-between"><span className="uppercase text-gray-500 font-black">Account Status</span>
                <span className={`flat-badge text-[10px] font-black border-2 py-0.5 px-2 ${selectedStudent.status === 'active' ? 'bg-flatEmerald text-white' : 'bg-red-500 text-white'}`}>
                  {selectedStudent.status === 'active' ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="flat-btn bg-black text-white hover:scale-102 text-xs py-2 px-6 uppercase"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
