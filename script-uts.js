

// Konfigurasi API Gemini
const API_KEY = "AIzaSyAOsPULoG3HfHLy3TzihKf4d5UJeifeez4";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let peserta; 


document.addEventListener('DOMContentLoaded', () => {
  // Ambil data peserta dari localStorage
  peserta = JSON.parse(localStorage.getItem('peserta'));
  if (peserta && peserta.nama) {
    document.getElementById('namaPeserta').textContent = peserta.nama;
  }
  
  
  startTimer();

  
  renderQuestions();
});


function renderQuestions() {
  const container = document.getElementById('questionsContainer');
  if (!container) return;
  
  questions.forEach(question => {
    
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question');
    
    questionDiv.dataset.number = question.number;
    questionDiv.dataset.correct = question.correct;
    questionDiv.dataset.explanation = question.explanation;
    
 
    const title = document.createElement('h3');
    title.textContent = `${question.number}. ${question.text}`;
    questionDiv.appendChild(title);
    
    
    question.options.forEach(option => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q${question.number}`;
      input.value = option.value;
      input.required = true;
      label.appendChild(input);
      
      
      const optionText = document.createTextNode(` ${option.text}`);
      label.appendChild(optionText);
      
      questionDiv.appendChild(label);
    });
    
    
    container.appendChild(questionDiv);
  });
}


function startTimer() {
  
  const startTime = peserta && peserta.startTime ? peserta.startTime : new Date().getTime();
  
  const duration = 20 * 1000;
  const endTime = startTime + duration;
  const timerElement = document.getElementById('timer');
  
  const timerInterval = setInterval(() => {
    const now = new Date().getTime();
    let diff = endTime - now;
    
    if (diff <= 0) {
      clearInterval(timerInterval);
     
      const finalScore = calculateScore();
      const result = {
        nama: peserta.nama,
        score: finalScore,
        duration: "Waktu habis",
        feedback: `Waktu habis! Skor akhir: ${finalScore}`
      };
      
      localStorage.setItem('hasilUjian', JSON.stringify(result));
      localStorage.removeItem('peserta');
      window.location.href = 'index.html';
      return;
    }
    
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
}


function calculateScore() {
  let score = 0;
  const questionElements = document.querySelectorAll('.question');
  questionElements.forEach(question => {
    const correctAnswer = question.dataset.correct;
    const selectedInput = question.querySelector('input:checked');
    if (selectedInput && selectedInput.value === correctAnswer) {
      score += 50;
    }
  });
  return score;
}


document.getElementById('utsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  
  const examData = {
    questions: [],
    answers: [],
    score: 0
  };

  
  const questionElements = document.querySelectorAll('.question');
  questionElements.forEach(question => {
    const questionNumber = question.dataset.number;
    const correctAnswer = question.dataset.correct;
    const explanation = question.dataset.explanation;
    const questionText = question.querySelector('h3').textContent;
    const selectedInput = question.querySelector('input:checked');
    const selectedAnswer = selectedInput ? selectedInput.value : 'tidak dijawab';
    
    examData.questions.push({
      number: questionNumber,
      text: questionText,
      correctAnswer: correctAnswer,
      explanation: explanation
    });
    
    examData.answers.push({
      question: questionNumber,
      selected: selectedAnswer
    });
    
    if (selectedAnswer === correctAnswer) {
      examData.score += 50;
    }
  });
  
  
  try {
    examData.feedback = await generateFeedback(examData);
  } catch (error) {
    console.error("Error generating feedback:", error);
    examData.feedback = "Maaf, feedback tidak dapat dimuat saat ini.";
  }
  
 
  const result = {
    nama: peserta.nama,
    score: examData.score,
    duration: document.getElementById('timer').textContent,
    feedback: examData.feedback
  };
  
  localStorage.setItem('hasilUjian', JSON.stringify(result));
  localStorage.removeItem('peserta');
  window.location.href = 'index.html';
});


async function generateFeedback(examData) {
  const prompt = `Berikan feedback untuk ujian dengan kriteria:
1. Analisis jawaban salah
2. Berikan penjelasan singkat
3. Gunakan format markdown
4. Bahasa Indonesia
5. Maksimal 500 karakter

Data ujian:
${JSON.stringify(examData, null, 2)}`;
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ "text": prompt }]
      }]
    })
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
