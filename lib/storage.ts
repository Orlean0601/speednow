export interface SavedTest {
  id: string;
  userId: string;
  name: string;
  date: string;
  speedKmh: number;
  speedMs: number;
  timeSeconds: number;
}

export const storage = {
  getSavedTests: (): SavedTest[] => {
    if (typeof window === 'undefined') return [];
    const tests = localStorage.getItem('speedtracker_tests');
    const allTests: SavedTest[] = tests ? JSON.parse(tests) : [];
    return allTests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  saveTest: (test: SavedTest) => {
    if (typeof window === 'undefined') return;
    const tests = localStorage.getItem('speedtracker_tests');
    const allTests: SavedTest[] = tests ? JSON.parse(tests) : [];
    allTests.push(test);
    localStorage.setItem('speedtracker_tests', JSON.stringify(allTests));
  }
};
