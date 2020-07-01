const socket = io()

// ELEMENTS
const form = document.querySelector('#form')
const sendButton = form.querySelector('button')
const input = form.querySelector('input')
const locationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')
// ELEMENTS

// TEMPLATES
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
// TEMPLATES

// OPTIONS
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
     // New message element
     const newMessage = messages.lastElementChild

     // Height of the new message
     const newMessageStyles = getComputedStyle(newMessage)
     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
     const newMessageHeight = newMessage.offsetHeight + newMessageMargin
 
     // Visible height
     const visibleHeight = messages.offsetHeight
 
     // Height of messages container
     const containerHeight = messages.scrollHeight
 
     // How far have I scrolled?
     const scrollOffset = messages.scrollTop + visibleHeight
 
     if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
     }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (locationLink) => {
    console.log(locationLink)

    const html = Mustache.render(locationMessageTemplate, {
        username: locationLink.username,
        locationLink : locationLink.locationLink ,
        createdAt: moment(locationLink.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    console.log(room)
    console.log(users)

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html
})

form.addEventListener('submit', (event) => {
    event.preventDefault()

    // SEND BUTTON DISABLED
    sendButton.setAttribute('disabled', 'disabled')

    const message = event.target.elements.msg.value
    socket.emit('sendMessage', message, (error) => {
        // SEND BUTTON ENABLED
        sendButton.removeAttribute('disabled')

        input.value = ''
        input.focus()

        if (error) {
            return console.log(error)
        }
        console.log('delivered')
    })
})

locationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Your browser does not support geolocation')
    }

    locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }

        socket.emit('sendLocation', locationData, () => {
            console.log('Location shared !')
            locationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }  
})