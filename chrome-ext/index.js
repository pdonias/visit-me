const phoneButton = document.getElementsByClassName('button-orange large phoneNumber trackable')[0]
const emailButton = document.getElementsByClassName('button-blue large trackable')[0]
const button = phoneButton || emailButton

if (button) {
  const icon = document.createElement('I')
  icon.setAttribute('class', 'icon-cv-plus icon-2x')

  const text = document.createElement('SPAN')
  text.innerHTML = 'Ajouter à visit.me'

  const addButton = document.createElement('BUTTON')
  addButton.setAttribute('class', 'button-orange button-secondary large trackable')
  addButton.style['margin-top'] = '1rem'
  addButton.appendChild(icon)
  addButton.appendChild(text)

  addButton.onclick = e => {
    e.preventDefault()
    console.log(`Add ${window.location.href}`)

    var url = {"link": window.location.href};

    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance
    xmlhttp.open("POST", "http://127.0.0.1:5000/update");
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(url));

  }

  button.parentNode.appendChild(addButton)
}

// =============================================================================

const itemTitles = document.getElementsByClassName('item_title')
const saveButtons = document.getElementsByClassName('saveAd')

for (itemTitle of itemTitles) {
  // Prevent title from overflowing under the new buttons (OG margin is 3rem)
  itemTitle.style['margin-right'] = '8rem'
}

// Prevent adding saveAd class recursively and crash Chrome
const _saveButtons = [ ...saveButtons ]

for (const saveButton of _saveButtons) {
  const addButtonHome = document.createElement('I')
  addButtonHome.setAttribute('class', 'showTip mediumgrey icon-cv-plus icon-2x nomargin')

  // ---------------------------------------------------------------------------

  const innerWrapper = document.createElement('DIV')
  innerWrapper.setAttribute('class', 'saveMsg')
  innerWrapper.onclick = e => {
    e.preventDefault()
    console.log(`Add ${saveButton.parentNode.href}`)
    alert(`Add ${saveButton.parentNode.href}`)
  }
  innerWrapper.appendChild(addButtonHome)

  // ---------------------------------------------------------------------------

  const wrapper = document.createElement('DIV')
  wrapper.setAttribute('class', 'saveAd')
  wrapper.style.right = '50px'

  wrapper.appendChild(innerWrapper)
  wrapper.setAttribute('title', 'Ajouter à visit.me')

  saveButton.parentNode.appendChild(wrapper)
}

console.log('--- visit.me extension loaded ---')
