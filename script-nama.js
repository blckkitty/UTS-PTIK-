document.getElementById('registrationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('nama').value.trim();
    
    if(nama) {
        localStorage.setItem('peserta', JSON.stringify({
            nama: nama,
            startTime: new Date().getTime()
        }));
        window.location.href = 'uts-form.html';
    }
});