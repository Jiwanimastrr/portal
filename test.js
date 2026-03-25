const TIERS = [
  { name: 'A', threshold: 0.1 }, { name: 'B', threshold: 0.5 }, { name: 'C', threshold: 1.0 }
];
let students = [
  { id: '1', totalStamps: 1 }, { id: '2', totalStamps: 2 }, { id: '3', totalStamps: 5 }
];

function calculateTiers() {
    const sorted = [...students].sort((a, b) => b.totalStamps - a.totalStamps);
    const N = sorted.length;
    let currentRank = 1;
    sorted.forEach((student, index) => {
      if (index > 0 && sorted[index - 1].totalStamps !== student.totalStamps) {
        currentRank = index + 1;
      }
      const rank = currentRank; 
      const percent = N > 1 ? (rank - 1) / (N - 1) : 0; 
      let assignedTier = TIERS[TIERS.length - 1]; 
      if (student.totalStamps === 0) {
        assignedTier = TIERS[TIERS.length - 1];
      } else {
        for (let i = 0; i < TIERS.length; i++) {
          if (percent <= TIERS[i].threshold) {
             assignedTier = TIERS[i];
             break;
          }
        }
      }
      student.rank = rank;
      student.tier = assignedTier;
    });
    return sorted;
}

function giveStamp(id) {
    const beforeTiers = calculateTiers();
    const prevTier = beforeTiers.find(s => s.id === id)?.tier;

    const student = students.find(s => s.id === id);
    if (student) {
      student.totalStamps += 5; // give enough stamps to change tier
      
      const afterTiers = calculateTiers();
      const currTier = afterTiers.find(s => s.id === id)?.tier;

      console.log('prevTier:', prevTier?.name, 'currTier:', currTier?.name);
      if (prevTier && currTier && prevTier.name !== currTier.name) {
        console.log("PROMOTED!");
      } else {
        console.log("NO PROMOTION");
      }
    }
}

giveStamp('1');
