import React from 'react'
import Navbar from '../Navbar/Navbar'
import Hero from '../Hero/Hero'
import Introduction from '../Introduction/Introduction'
import Jasasection from '../Jasasection/Jasasection'
import Ordersection from '../Ordersection/Ordersection'
import Minicompany from '../Minicompany/Minicompany'
import Footer from '../Footer/Footer'

const Beranda = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Introduction />
      <Jasasection />
      <Ordersection />
      <Minicompany />
      <Footer />
    </>
  );
};

export default Beranda
