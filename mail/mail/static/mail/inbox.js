document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Button which runs send_email which causes mail to be sent
  document.querySelector('#sendmail').addEventListener('click', send_email);


  // By default, load the inbox
  load_mailbox('inbox');
});


// Used to compose emails
function compose_email() {
  //Clear the id div
  document.querySelector('#email-content').innerHTML = ""

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Used to load up a mailbox
function load_mailbox(mailbox) {
  //Clear the id div
  document.querySelector('#email-content').innerHTML = ""

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load Emails
  load_emails(mailbox);
}


// Used to send email
function send_email(event) {
  event.preventDefault();

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
      //Switch Pages
      load_mailbox('sent')
  });
}


// Used to load all emails for viewing
function load_emails(mailbox) {
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
    // Print out emails to correct mailbox
    emails.forEach(function(item) {
      if (item.read != true) {
        document.querySelector('#emails-view').innerHTML += `<div id="email-view-mail"><button class="btn btn-outline-dark" onclick="open_email(${item.id})"><span id="inbox-sender"><strong>${item.sender}</strong></span></button> <span id="inbox-subject">${item.subject}</span> <span id="inbox-timestamp">${item.timestamp}</span></div>`
      } else {
        document.querySelector('#emails-view').innerHTML += `<div id="email-read-mail"><button class="btn btn-outline-dark" onclick="open_email(${item.id})"><span id="inbox-sender"><strong>${item.sender}</strong></span></button> <span id="inbox-subject">${item.subject}</span> <span id="inbox-timestamp">${item.timestamp}</span></div>`
      }
    });
  });
}

// Used to open a specific email
function open_email(email_id) {
  fetch('/emails/'+email_id)
  .then(response => response.json())
  .then(email => {
    // Clear innerHTML
    document.querySelector('#emails-view').innerHTML = ""

    // Load email

    if (email.archived == false && email.sender != email.recipients) {
      document.querySelector('#emails-view').innerHTML += `<div id="email-from"><strong>From:</strong> ${email.sender}<p></p>
      <strong>To:</strong> ${email.recipients}<p></p>
      <strong>Subject:</strong> ${email.subject}<p></p>
      <strong>Timestamp:</strong> ${email.timestamp}</div><p></p>
      <button id="email-archive" class="btn btn-outline-secondary">Archive</button> <button id="email-reply" class="btn btn-outline-secondary">Reply</button><p></p>
      ______________________________________________________________<br></br>`

      document.querySelector('#email-archive').addEventListener('click', function() {
        mark_archive(email.id);
      })

      document.querySelector('#email-reply').addEventListener('click', function() {
        reply(email.sender, email.subject, email.timestamp, email.body)
      })

    } else if (email.archived == true && email.sender != email.recipients) {
      document.querySelector('#emails-view').innerHTML += `<div id="email-from"><strong>From:</strong> ${email.sender}<p></p>
      <strong>To:</strong> ${email.recipients}<p></p>
      <strong>Subject:</strong> ${email.subject}<p></p>
      <strong>Timestamp:</strong> ${email.timestamp}</div><p></p>
      <button id="remove-archive" class="btn btn-outline-secondary">Remove Archive</button> <button id="email-reply" class="btn btn-outline-secondary">Reply</button><p></p>
      ______________________________________________________________<br></br>`  

      document.querySelector('#remove-archive').addEventListener('click', function() {
        remove_archive(email.id)
      })

      document.querySelector('#email-reply').addEventListener('click', function() {
        reply(email.sender, email.subject, email.timestamp, email.body)
      })

    } else if (email.archived == false && email.sender == email.recipients) {
      document.querySelector('#emails-view').innerHTML += `<div id="email-from"><strong>From:</strong> ${email.sender}<p></p>
      <strong>To:</strong> ${email.recipients}<p></p>
      <strong>Subject:</strong> ${email.subject}<p></p>
      <strong>Timestamp:</strong> ${email.timestamp}</div><p></p>
      <button id="email-reply" class="btn btn-outline-secondary">Reply</button><p></p>
      ______________________________________________________________<br></br>`

      document.querySelector('#email-reply').addEventListener('click', function() {
        reply(email.sender, email.subject, email.timestamp, email.body)
      })

    } else if (email.archived == true && email.sender == email.recipients) {
      email.archived = false
      document.querySelector('#emails-view').innerHTML += `<div id="email-from"><strong>From:</strong> ${email.sender}<p></p>
      <strong>To:</strong> ${email.recipients}<p></p>
      <strong>Subject:</strong> ${email.subject}<p></p>
      <strong>Timestamp:</strong> ${email.timestamp}</div><p></p>
      <button id="email-reply" class="btn btn-outline-secondary">Reply</button><p></p>
      ______________________________________________________________<br></br>`

      document.querySelector('#email-reply').addEventListener('click', function() {
        reply(email.sender, email.subject, email.timestamp, email.body)
      })

    }
    
    document.querySelector('#email-content').innerHTML += `<div id="email-body">${email.body}</div>`

    mark_read(email_id);
    console.log(email);
  });
}

// Used to mark an email as read
function mark_read(email_id) {
  fetch('/emails/'+email_id, {
    method: 'PUT',
    body: JSON.stringify({
        read: true,
    })
 })
 console.log("Email marked as Read")
}

// Used to mark an email as archived
function mark_archive(email_id) {
  fetch('/emails/'+email_id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true,
    })
 })
 load_mailbox('archive')
 console.log("Email Archived")
}

// Used to remove archive from email
function remove_archive(email_id) {
  fetch('/emails/'+email_id, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false,
    })
 })
 load_mailbox('inbox')
 console.log("Archived Removed")
}

// Used to reply to an email
function reply(email_recipient, email_subject, email_timestamp, email_body) {
  compose_email()

  document.querySelector('#compose-recipients').value = email_recipient;

  if (email_subject.includes("RE:")) {
    document.querySelector('#compose-subject').value = email_subject;
  } else {
    document.querySelector('#compose-subject').value = 'RE: '+ email_subject;
  }

  document.querySelector('#compose-body').value = 'On ' + email_timestamp + ' ' + email_recipient + ' wrote: ' + '"' + email_body + '"';

}