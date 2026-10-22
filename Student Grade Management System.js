const students = new Map();
const studentEmails = new Set();
let nextStudentId = 1001;

const gradeScale = [
  { min: 90, grade: "A" },
  { min: 80, grade: "B" },
  { min: 70, grade: "C" },
  { min: 60, grade: "D" },
  { min: 0, grade: "F" }
];

const validateScore = (score) => {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error("Score must be a number between 0 and 100.");
  }
};

const calculateGrade = (average) => {
  validateScore(average);
  return gradeScale.find(({ min }) => average >= min).grade;
};

const calculateAverage = (scores) => {
  if (!scores.length) return 0;

  return Number(
    (scores.reduce((sum, score) => sum + score, 0) / scores.length)
      .toFixed(2)
  );
};

const addStudent = ({ name, email, course, scores = {} }) => {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Student name is required.");
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email address is required.");
  }

  if (typeof course !== "string" || !course.trim()) {
    throw new Error("Course is required.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (studentEmails.has(normalizedEmail)) {
    throw new Error("A student with this email already exists.");
  }

  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    throw new Error("Scores must be an object.");
  }

  for (const [subject, score] of Object.entries(scores)) {
    if (!subject.trim()) {
      throw new Error("Subject names cannot be empty.");
    }

    validateScore(score);
  }

  const id = nextStudentId++;

  const student = {
    id,
    name: name.trim(),
    email: normalizedEmail,
    course: course.trim(),
    scores: { ...scores },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  students.set(id, student);
  studentEmails.add(normalizedEmail);

  return getStudentReport(id);
};

const getStudent = (id) => students.get(id) ?? null;

const getStudentReport = (id) => {
  const student = getStudent(id);

  if (!student) {
    throw new Error(`Student ${id} was not found.`);
  }

  const scores = Object.values(student.scores);
  const average = calculateAverage(scores);

  return {
    ...student,
    subjectCount: scores.length,
    average,
    grade: scores.length ? calculateGrade(average) : "N/A",
    status: scores.length
      ? average >= 50 ? "Pass" : "Fail"
      : "Not graded"
  };
};

const updateStudent = (id, updates = {}) => {
  const student = getStudent(id);

  if (!student) {
    throw new Error(`Student ${id} was not found.`);
  }

  const updated = { ...student };

  if (updates.name !== undefined) {
    if (typeof updates.name !== "string" || !updates.name.trim()) {
      throw new Error("Name cannot be empty.");
    }

    updated.name = updates.name.trim();
  }

  if (updates.course !== undefined) {
    if (typeof updates.course !== "string" || !updates.course.trim()) {
      throw new Error("Course cannot be empty.");
    }

    updated.course = updates.course.trim();
  }

  if (updates.email !== undefined) {
    if (
      typeof updates.email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email.trim())
    ) {
      throw new Error("A valid email address is required.");
    }

    const newEmail = updates.email.trim().toLowerCase();

    if (newEmail !== student.email && studentEmails.has(newEmail)) {
      throw new Error("That email belongs to another student.");
    }

    studentEmails.delete(student.email);
    studentEmails.add(newEmail);
    updated.email = newEmail;
  }

  updated.updatedAt = new Date().toISOString();
  students.set(id, updated);

  return getStudentReport(id);
};

const deleteStudent = (id) => {
  const student = getStudent(id);

  if (!student) return false;

  studentEmails.delete(student.email);
  return students.delete(id);
};

const addScore = (id, subject, score) => {
  const student = getStudent(id);

  if (!student) {
    throw new Error(`Student ${id} was not found.`);
  }

  if (typeof subject !== "string" || !subject.trim()) {
    throw new Error("Subject is required.");
  }

  validateScore(score);

  const subjectName = subject.trim();

  student.scores[subjectName] = score;
  student.updatedAt = new Date().toISOString();

  return getStudentReport(id);
};

const removeSubjectScore = (id, subject) => {
  const student = getStudent(id);

  if (!student) {
    throw new Error(`Student ${id} was not found.`);
  }

  const removed = Object.hasOwn(student.scores, subject);

  if (removed) {
    delete student.scores[subject];
    student.updatedAt = new Date().toISOString();
  }

  return removed;
};

const searchStudents = (query) => {
  const term = String(query).trim().toLowerCase();

  return [...students.values()]
    .filter((student) =>
      student.name.toLowerCase().includes(term) ||
      student.email.includes(term) ||
      student.course.toLowerCase().includes(term) ||
      String(student.id).includes(term)
    )
    .map((student) => getStudentReport(student.id));
};

const filterByCourse = (course) => {
  const normalizedCourse = course.trim().toLowerCase();

  return [...students.values()]
    .filter((student) =>
      student.course.toLowerCase() === normalizedCourse
    )
    .map((student) => getStudentReport(student.id));
};

const getTopStudents = (limit = 5) => {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("Limit must be a positive integer.");
  }

  return [...students.values()]
    .map((student) => getStudentReport(student.id))
    .filter((student) => student.subjectCount > 0)
    .sort((a, b) => b.average - a.average)
    .slice(0, limit);
};

const getStudentsByGrade = (grade) => {
  return [...students.values()]
    .map((student) => getStudentReport(student.id))
    .filter((student) => student.grade === grade);
};

const getClassStatistics = () => {
  const reports = [...students.values()]
    .map((student) => getStudentReport(student.id));

  const graded = reports.filter(
    (student) => student.subjectCount > 0
  );

  const gradeDistribution = new Map(
    gradeScale.map(({ grade }) => [grade, 0])
  );

  for (const student of graded) {
    gradeDistribution.set(
      student.grade,
      gradeDistribution.get(student.grade) + 1
    );
  }

  const courseStats = new Map();

  for (const student of graded) {
    if (!courseStats.has(student.course)) {
      courseStats.set(student.course, {
        students: 0,
        totalAverage: 0,
        passCount: 0
      });
    }

    const stats = courseStats.get(student.course);

    stats.students++;
    stats.totalAverage += student.average;

    if (student.status === "Pass") {
      stats.passCount++;
    }
  }

  for (const stats of courseStats.values()) {
    stats.average = Number(
      (stats.totalAverage / stats.students).toFixed(2)
    );

    stats.passRate = Number(
      ((stats.passCount / stats.students) * 100).toFixed(2)
    );

    delete stats.totalAverage;
  }

  const classAverage = graded.length
    ? calculateAverage(graded.map((student) => student.average))
    : 0;

  return {
    totalStudents: reports.length,
    gradedStudents: graded.length,
    ungradedStudents: reports.length - graded.length,
    classAverage,
    highestAverage: graded.length
      ? Math.max(...graded.map((student) => student.average))
      : null,
    lowestAverage: graded.length
      ? Math.min(...graded.map((student) => student.average))
      : null,
    passCount: graded.filter((student) => student.status === "Pass").length,
    failCount: graded.filter((student) => student.status === "Fail").length,
    gradeDistribution: Object.fromEntries(gradeDistribution),
    courseStatistics: Object.fromEntries(courseStats)
  };
};

const sortStudents = (key = "name", direction = "asc") => {
  const allowedKeys = ["name", "course", "average", "grade", "id"];

  if (!allowedKeys.includes(key)) {
    throw new Error(`Unsupported sort key: ${key}`);
  }

  if (!["asc", "desc"].includes(direction)) {
    throw new Error('Direction must be "asc" or "desc".');
  }

  const multiplier = direction === "asc" ? 1 : -1;

  return [...students.values()]
    .map((student) => getStudentReport(student.id))
    .sort((a, b) => {
      const first = a[key];
      const second = b[key];

      if (typeof first === "string") {
        return first.localeCompare(second) * multiplier;
      }

      return (first - second) * multiplier;
    });
};

const exportStudents = () => {
  return JSON.stringify({
    version: 1,
    nextStudentId,
    students: [...students.values()]
  }, null, 2);
};

const displayStudents = () => {
  console.table(
    [...students.values()].map((student) => {
      const report = getStudentReport(student.id);

      return {
        id: report.id,
        name: report.name,
        course: report.course,
        subjects: report.subjectCount,
        average: report.average,
        grade: report.grade,
        status: report.status
      };
    })
  );
};

addStudent({
  name: "Alice Mwangi",
  email: "alice@example.com",
  course: "JavaScript",
  scores: {
    Algorithms: 92,
    "Web Development": 87,
    Databases: 90
  }
});

addStudent({
  name: "Brian Otieno",
  email: "brian@example.com",
  course: "JavaScript",
  scores: {
    Algorithms: 65,
    "Web Development": 72,
    Databases: 68
  }
});

addStudent({
  name: "Carol Wanjiku",
  email: "carol@example.com",
  course: "Python",
  scores: {
    Algorithms: 96,
    "Web Development": 94,
    Databases: 98
  }
});

addStudent({
  name: "David Kimani",
  email: "david@example.com",
  course: "Python"
});

addScore(1004, "Algorithms", 78);
addScore(1004, "Databases", 82);

console.log("Student report:", getStudentReport(1001));
console.log("Search results:", searchStudents("Alice"));
console.log("Top students:", getTopStudents(3));
console.log("Grade A students:", getStudentsByGrade("A"));
console.log("Class statistics:", getClassStatistics());

displayStudents();