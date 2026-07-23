import { useEffect, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import api from '../../services/api.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import { TableRowSkeleton } from '../../components/ui/LoadingSkeleton.jsx';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/students', { params: { limit: 500 } })
      .then((res) => { setStudents(res.data.data.students); setTotal(res.data.data.total); })
      .catch(() => setStudents([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const nameStr = s.studentName || `${s.firstName || ''} ${s.lastName || ''}`;
    return (
      nameStr.toLowerCase().includes(q) ||
      s.prn?.toLowerCase().includes(q) ||
      s.rollNumber?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-dark-50 font-black text-2xl">Students</h2>
          <p className="text-dark-500 text-sm mt-1">{total} registered students</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" />
        <input className="input pl-10" placeholder="Search by name, PRN, or department..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-800">
              <th className="text-left px-5 py-4 text-dark-500 text-xs font-semibold uppercase tracking-wider">Student</th>
              <th className="text-left px-5 py-4 text-dark-500 text-xs font-semibold uppercase tracking-wider hidden md:table-cell">PRN No.</th>
              <th className="text-left px-5 py-4 text-dark-500 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Department</th>
              <th className="text-left px-5 py-4 text-dark-500 text-xs font-semibold uppercase tracking-wider hidden xl:table-cell">Year</th>
              <th className="text-left px-5 py-4 text-dark-500 text-xs font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16">
                  <EmptyState icon={BookOpen} title="No students found" description={search ? 'Try adjusting your search.' : 'No students registered yet.'} />
                </td>
              </tr>
            ) : (
              filtered.map((student) => (
                <tr key={student._id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-all">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={student.avatar} name={student.studentName || `${student.firstName} ${student.lastName}`} size="sm" />
                      <div>
                        <p className="text-dark-100 text-sm font-semibold">{student.studentName || `${student.firstName} ${student.lastName}`}</p>
                        <p className="text-dark-500 text-xs">{student.prn}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-dark-300 text-sm font-mono">{student.prn || '—'}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-dark-400 text-sm">{student.department || '—'}</span>
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <span className="text-dark-400 text-sm">{student.academicYear || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="success">Active</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;
