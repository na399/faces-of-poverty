function renderViz(dataset, faceComponents, lang) {

  lang = lang || 'th'

  // Draw the map
  let options = {
    radius: 30
  }  

  let svg = d3.select('svg#map')
    .attr('width', options.radius * 25)
    .attr('height', options.radius * 42)

  let face = svg.append('g')
    .selectAll('g')
    .data(dataset)
    .enter().append('g')
    .attr('transform', d => {
      return 'translate(' + (d.x * options.radius * 2) + ',' + (d.y * options.radius * 2.2) + ')'
    })


  let cYellow = d3.color('#FFF740')

  let cScale = d3.scaleQuantile()
    .domain(dataset.map(d => d['poor.JPT.CNT.rate']))
    .range(d3.range(4).map(i => cYellow.darker(i - 0.5)))

  let faceCircle = face.append('circle')
    .attr('class', 'faceCircle')
    .attr('r', options.radius - 2)
    .attr('cx', options.radius * 2)
    .attr('cy', options.radius * 2)
    .style('fill', d => cScale(d['poor.JPT.CNT.rate']))


  face.append('text')
    .attr('x', options.radius * 2)
    .attr('y', options.radius * 3 + 6)
    .style('text-anchor', 'middle')
    .style('font-size', '11px')
    .text(d => {
      if (lang == 'en') {
        return d.enAbbr
      } else if (lang == 'th') {
        return d.thName
      }
    })


  // Add facial parts with quantile scales 
  let faceParts = face.append('g')
    .attr('transform', `translate(${options.radius}, ${options.radius}) scale(${options.radius / 100})`)

  faceParts.append('g')
    .html(faceComponents.nose)

  function getComponent(item) {
    switch (item) {
      case 'living':
        return faceComponents.mouth
      case 'education':
        return faceComponents.eye
      case 'income':
        return faceComponents.eyebrow
      case 'health':
        return faceComponents.mucus
      case 'accessibility':
        return faceComponents.anger
    }
  }

  function appendComponent(item, faceParts) {
    let scale = d3.scaleQuantile()
      .domain(dataset.map(d => d[`poor.JPT.MOFval.${item}.rate`]))
      .range(d3.range(4).map(i => getComponent(item)[i]))

    faceParts.append('g')
      .html(d => scale(d[`poor.JPT.MOFval.${item}.rate`]))
  }

  ['living', 'education', 'income', 'health', 'accessibility'].map(item => appendComponent(item, faceParts))


  // Render tooltip
  let tooltip = d3.select(".content").append("div")
    .attr("class", "tooltip")

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
  }


  function getSortedRates(dataset, item) {
    let rates = dataset.reduce((rates, d) => {
      rates.push(+d[item])
      return rates
    }, [])
    let sorted = rates.slice().sort(function (a, b) {
      return a - b
    })
    return sorted
  }

  let [cntRates, healthRates, livingRates, educationRates, incomeRates, accessibilityRates] = [
    'poor.JPT.CNT.rate', 'poor.JPT.MOFval.health.rate', 'poor.JPT.MOFval.living.rate',
    'poor.JPT.MOFval.education.rate', 'poor.JPT.MOFval.income.rate', 'poor.JPT.MOFval.accessibility.rate'
  ].map(s => getSortedRates(dataset, s))

  face.on("mouseover", function (d) {
      d3.select(this)
        .select(".faceCircle")
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('stroke', "#59CCFF")
        .attr('stroke-width', options.radius / 8)

      tooltip.transition()
        .duration(200)
        .style("opacity", 0.95)
        .style("left", `${d3.event.pageX + options.radius}px`)
        .style("top", `${d3.event.pageY + 0.5 * options.radius}px`)

      if (lang == 'en') {
        tooltip.html(
          `
          <strong>${d.enName}</strong>
          <hr />
          <p>${numberWithCommas(d['poor.JPT.MOFval.CNT'])} people lived in poverty accounted for ${round(d['poor.JPT.CNT.rate'] * 100, 1)} % of ${numberWithCommas(d['HOUSEMEMBER_CNT'])} people surveyed.</p>
          <p>#<button>${cntRates.indexOf(+d['poor.JPT.CNT.rate'])+1}</button> / 76 in the country</p>
          <hr />
          <p>#<button>${healthRates.indexOf(+d['poor.JPT.MOFval.health.rate'])+1}</button>: ${numberWithCommas(d['poor.JPT.MOFval.health'])} people or ${round(d['poor.JPT.MOFval.health.rate'] * 100, 1)} % had deprived healthcare.</p>
          <p>#<button>${livingRates.indexOf(+d['poor.JPT.MOFval.living.rate'])+1}</button>: ${numberWithCommas(d['poor.JPT.MOFval.living'])} people or ${round(d['poor.JPT.MOFval.living.rate'] * 100, 1)} % had deprived living conditions.</p>
          <p>#<button>${educationRates.indexOf(+d['poor.JPT.MOFval.education.rate'])+1}</button>: ${numberWithCommas(d['poor.JPT.MOFval.education'])} people or ${round(d['poor.JPT.MOFval.education.rate'] * 100, 1)} % had deprived education.</p>
          <p>#<button>${incomeRates.indexOf(+d['poor.JPT.MOFval.income.rate'])+1}</button>: ${numberWithCommas(d['poor.JPT.MOFval.income'])} people or ${round(d['poor.JPT.MOFval.income.rate'] * 100, 1)} % had deprived income.</p>
          <p>#<button>${accessibilityRates.indexOf(+d['poor.JPT.MOFval.accessibility.rate'])+1}</button>: ${numberWithCommas(d['poor.JPT.MOFval.accessibility'])} people or ${round(d['poor.JPT.MOFval.accessibility.rate'] * 100, 1)} % had deprived access to public services.</p>
          `
        )
      } else if (lang == 'th') {
        tooltip.html(
          `
          <strong>${d.thName}</strong>
          <hr />
          <p>จำนวนคนจน ${numberWithCommas(d['poor.JPT.MOFval.CNT'])} คน คิดเป็น ${round(d['poor.JPT.CNT.rate'] * 100, 1)} % ของจำนวนคนที่สำรวจทั้งจังหวัด ${numberWithCommas(d['HOUSEMEMBER_CNT'])} คน</p>
          <p><small>เป็นอันดับที่ <button>${cntRates.indexOf(+d['poor.JPT.CNT.rate'])+1}</button> ของประเทศ</small></p>
          <hr />
          <p>มีคนจนด้านสุขภาพ ${numberWithCommas(d['poor.JPT.MOFval.health'])} คน คิดเป็น ${round(d['poor.JPT.MOFval.health.rate'] * 100, 1)} % <small>ของจำนวนคนที่สำรวจทั้งจังหวัด เป็นอันดับที่</small> <button>${healthRates.indexOf(+d['poor.JPT.MOFval.health.rate'])+1}</button> <small>ของประเทศ</small></p>
          <p>มีคนจนด้านความเป็นอยู่ ${numberWithCommas(d['poor.JPT.MOFval.living'])} คน คิดเป็น ${round(d['poor.JPT.MOFval.living.rate'] * 100, 1)} % <small>ของจำนวนคนที่สำรวจทั้งจังหวัด เป็นอันดับที่</small> <button>${livingRates.indexOf(+d['poor.JPT.MOFval.living.rate'])+1}</button> <small>ของประเทศ</small></p>
          <p>มีคนจนด้านการศึกษา ${numberWithCommas(d['poor.JPT.MOFval.education'])} คน คิดเป็น ${round(d['poor.JPT.MOFval.education.rate'] * 100, 1)} % <small>ของจำนวนคนที่สำรวจทั้งจังหวัด เป็นอันดับที่</small>  <button>${educationRates.indexOf(+d['poor.JPT.MOFval.education.rate'])+1}</button> <small>ของประเทศ</small></p>
          <p>มีคนจนด้านรายได้ ${numberWithCommas(d['poor.JPT.MOFval.income'])} คน คิดเป็น ${round(d['poor.JPT.MOFval.income.rate'] * 100, 1)} % <small>ของจำนวนคนที่สำรวจทั้งจังหวัด เป็นอันดับที่</small>  <button>${incomeRates.indexOf(+d['poor.JPT.MOFval.income.rate'])+1}</button> <small>ของประเทศ</small></p>
          <p>มีคนจนด้านการเข้าถึงบริการภาครัฐ ${numberWithCommas(d['poor.JPT.MOFval.accessibility'])} คน คิดเป็น ${round(d['poor.JPT.MOFval.accessibility.rate'] * 100, 2)} % <small>ของจำนวนคนที่สำรวจทั้งจังหวัด เป็นอันดับที่</small> <button>${accessibilityRates.indexOf(+d['poor.JPT.MOFval.accessibility.rate'])+1}</button> <small>ของประเทศ</small></p>
          `
        )
      }
    })
    .on("mouseout", function (d) {
      d3.select(this)
        .select(".faceCircle")
        .attr('stroke', null)

      tooltip.transition()
        .duration(500)
        .style("opacity", 0)
    })
}


function transformDataset(dataset, datasetCommon, provinces) {

  let provinceInfo = provinces.province

  // Combine province data
  dataset = alasql(
    'SELECT * FROM ? dataset \
   LEFT JOIN ? datasetCommon ON dataset.province_ID = datasetCommon.province_ID',
    [dataset, datasetCommon])

  // Find province names with given IDs in the csv data file
  dataset = alasql(
    'SELECT * FROM ? dataset \
   LEFT JOIN ? provinceInfo ON dataset.province_ID = provinceInfo.id',
    [dataset, provinceInfo])

  // Find geopositions of provinces by JOIN with gridmapLayoutThailand
  dataset.forEach(d => {
    d.province_name_eng = d.province_name_eng.replace(/\s/g, "")
  }, dataset)
  dataset = alasql(
    'SELECT * FROM ? dataset \
   LEFT JOIN ? gridmapLayoutThailand ON dataset.province_name_eng = gridmapLayoutThailand.enName',
    [dataset, gridmapLayoutThailand])

  // Transform data
  dataset.forEach(d => {
    denominator = d['HOUSEMEMBER_CNT']
    d['poor.JPT.CNT.rate'] = d['poor.JPT.MOFval.CNT'] / denominator
    d['poor.JPT.MOFval.living.rate'] = d['poor.JPT.MOFval.living'] / denominator
    d['poor.JPT.MOFval.education.rate'] = d['poor.JPT.MOFval.education'] / denominator
    d['poor.JPT.MOFval.income.rate'] = d['poor.JPT.MOFval.income'] / denominator
    d['poor.JPT.MOFval.health.rate'] = d['poor.JPT.MOFval.health'] / denominator
    d['poor.JPT.MOFval.accessibility.rate'] = d['poor.JPT.MOFval.accessibility'] / denominator
  }, dataset)

  return dataset
}