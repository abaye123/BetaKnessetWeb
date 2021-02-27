import React, { useState, useEffect } from 'react'
import { Bar } from '@reactchartjs/react-chart.js'
import { useQuery } from '../../../utils'

import config from '../../../config'
 
export default React.memo(function HistogramView() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const query = useQuery()

    useEffect(() => {
      (async () => {
        setLoading(true)
        const res = await (await fetch(`${config.server}/KeywordTrend?keyword=${query}`)).json()
        setData(res)
        setLoading(false)
      })()
    }, [setLoading, query])
  
    if (loading) {
      return null
    }

    if (!data.length || data.every(d => !d.counter))
        return null

    const dataFn = (canvas) => {
      const ctx = canvas.getContext("2d")
      const gradient = ctx.createLinearGradient(0, 0, 0, 140);
      gradient.addColorStop(0, 'rgba(0,100,255,.6)');   
      gradient.addColorStop(1, 'rgba(0,100,255,.2)');

      return {    
        labels: data.map(d => `${d.month}.${(parseInt(d.year) % 100).toString().padStart(2, '0')}`),
        datasets: [
          {
            type: 'line',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 2,
            pointRadius: 2,
            pointRadiusHover: 10,
            fill: true,
            data: data.map(d => d.counter),
            backgroundColor: gradient
          },
          {
            type: 'bar',
            backgroundColor: 'transparent',
            data: data.map(d => d.counter),
          },
        ],
      }
    }

    const options = {
      onClick: function(evt, element) {
        if (!element.length)
          return
        const {month, year, counter} = data[element[0]._index]
        if (!counter)
          return

        // TODO
        console.log(month, year)
      },
      layout: {
        padding: {
          top: 5,
        }
      },
      scales: {
        xAxes: [{
            barPercentage: .95,
            gridLines: {
                display:false
            },
            ticks: {
              fontColor: "#444", // this here
            },
        }],
        yAxes: [{
            display: false,
            gridLines: {
                display:false
            },
        }]
      },
      legend: {
        display: false
      },
      tooltips: {
        rtl: true,
        custom: function(tooltip) {
          if (!tooltip) return;
          // disable displaying the color box;
          tooltip.displayColors = false;
        },
        callbacks: {
          label: function(tooltipItem, data) {
            return `${tooltipItem.yLabel} תוצאות`
          }
        }
      },

      plugins: {
        // important - disabling chartjs-plugin-datalabels stupid global override
        datalabels: {
            formatter: () => ""
        }
      },
    }

return (
  <div style={{position: 'sticky', bottom: 0, zIndex: 15, width: '100%'}}>
    <Bar data={dataFn} height={17} options={options} />
  </div>
  )
})
