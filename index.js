document.addEventListener('DOMContentLoaded', () => {
    const addBookForm = document.getElementById('addBookForm');
    const issueBookForm = document.getElementById('issueBookForm');
    const reserveBookForm = document.getElementById('reserveBookForm');
    const bookStudyRoomForm = document.getElementById('bookStudyRoomForm');
    const addMemberForm = document.getElementById('addMemberForm');
    const manageFinesForm = document.getElementById('manageFinesForm');

    // Helper: create list items
    function createListItem(text) {
        const li = document.createElement('li');
        li.textContent = text;
        return li;
    }

    // 🔁 BOOKS
    function loadBookList() {
        fetch('/api/books')
            .then(res => res.json())
            .then(books => {
                const list = document.getElementById('bookList');
                list.innerHTML = '';
                books.forEach(book => {
                    list.appendChild(createListItem(`${book.title} by ${book.author} (ISBN: ${book.isbn})`));
                });
            });
    }

    addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const isbn = document.getElementById('isbn').value;

        fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, isbn })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                addBookForm.reset();
                loadBookList();
            })
            .catch(error => alert('Error adding book: ' + error.message));
    });

    // 👥 MEMBERS
    function loadMemberList() {
        fetch('/api/members')
            .then(res => res.json())
            .then(members => {
                const list = document.getElementById('memberList');
                list.innerHTML = '';
                members.forEach(member => {
                    list.appendChild(createListItem(`${member.name} - ${member.email} (${member.contact})`));
                });
            });
    }

    addMemberForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('memberName').value;
        const email = document.getElementById('memberEmail').value;
        const contact = document.getElementById('memberContact').value;

        fetch('/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, contact })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                addMemberForm.reset();
                loadMemberList();
            })
            .catch(error => alert('Error adding member: ' + error.message));
    });

 // Book Issuing Form
 document.getElementById('issueBookForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form submission
  
    const formData = {
      book_id: Number(document.getElementById('bookId').value),
      member_id: Number(document.getElementById('memberId').value),
      issue_date: document.getElementById('issue_date').value,
      due_date: document.getElementById('due_date').value
    };
  
    try {
      const response = await fetch('http://127.0.0.1:5002/api/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      const result = await response.json();
      if (response.ok) {
        alert(result.message); // Display success message
        e.target.reset(); // Reset the form after successful submission
      } else {
        alert(`Error: ${result.error}`); // Display error message
      }
    } catch (error) {
      console.error('Error during book issue:', error);
      alert('Failed to issue book');
    }
  });
  
  
  
  // Study Room Booking Handler
  document.getElementById('bookStudyRoomForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const formData = {
        room_id: Number(document.getElementById('room_id').value),
        member_id: Number(document.getElementById('study_member_id').value),
        booking_date: document.getElementById('booking_date').value,
        hours: Number(document.getElementById('duration_hours').value)
      };
  
      const response = await fetch('http://localhost:5002/api/study-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to book room');
  
      alert(`Success: ${result.message}`);
      e.target.reset();
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error(error);
    }
  });
  
    
    // 📌 RESERVED BOOKS
    function loadReservedBooks() {
        fetch('/api/reserved-books')
            .then(res => res.json())
            .then(data => {
                const list = document.getElementById('reservedBookList');
                list.innerHTML = '';
                data.forEach(entry => {
                    list.appendChild(createListItem(`Book ID: ${entry.book_id}, Member ID: ${entry.member_id}, Reserved On: ${entry.reserve_date}`));
                });
            });
    }

    reserveBookForm.addEventListener('submit', (e) => {
        // e.preventDefault();
        const book_id = document.getElementById('reserveBookId').value;
        const member_id = document.getElementById('reserveMemberId').value;
        const reserve_date = document.getElementById('reserve_date').value;

        fetch('/api/reserve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ book_id, member_id, reserve_date })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                reserveBookForm.reset();
                loadReservedBooks();
            })
            .catch(error => alert('Error reserving book: ' + error.message));
    });


  

    // 💰 FINES (no list for now, just action)
    manageFinesForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const member_id = document.getElementById('fineMemberId').value;
        const fine_amount = document.getElementById('fineAmount').value;

        fetch('/api/fines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ member_id, fine_amount })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                manageFinesForm.reset();
            })
            .catch(error => alert('Error managing fine: ' + error.message));
    });

    // ⏬ Initial loads
    loadBookList();
    loadMemberList();
    loadIssuedBooks();
    loadReservedBooks();
    loadStudyRoomBookings();
});
