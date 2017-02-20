function pure (text) {
  return text
    .replace(/^ | $/g, '') // "6 rue foo " => "6 rue foo"
    .replace(/ +/g, ' ') // "6   rue  foo" => "6 rue foo"
}

module.exports = function (text) {
  var results = [
    {
      str: "Terrasse",
      re: /terrasse(( de)? \d{0,3}(,\d{0,2})?( |)m(²|2))?/,
      found: false,
      text: ""
    },
    {
      str: "Place de parking",
      re: /parking|stationnement/,
      found: false,
      text: ""
    },
    {
      str: "Libre le",
      re: /(libre|disponible) (de suite|le \d{1,2}\/?\d{1,2}|en \w+|début \w+|à partir de \w+|à partir du \w+)/,
      found: false,
      text: ""
    },
    {
      str: "Etage",
      re: /(\d(e|er|[e|è]me) )?[é|e]tage/,
      found: false,
      text: ""
    },
    {
      str: "Ascenseur",
      re: /ascenseur/,
      found: false,
      text: ""
    },
    {
      str: "Chambres",
      re: /(\d+|\w+) chambre(s?)/,
      found: false,
      text: ""
    }
  ]
  let matches

  for (var i = 0, len = results.length; i < len; i++) {
    var regex = results[i].re;
    matches = regex.exec(text)
    if (matches) {
      results[i].found = true;
      results[i].text = pure(matches[0]);
    }
  }

  return results
}
