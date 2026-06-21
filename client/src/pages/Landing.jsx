import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, FileSpreadsheet, Sparkles, 
  ArrowRight, BookOpen, Calculator, Play, CheckCircle2, ChevronRight
} from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Interactive Tab State for definitions
  const [activeTab, setActiveTab] = useState('ingresos');
  const [planPrice, setPlanPrice] = useState(27);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/billing/public-config');
        if (res.ok) {
          const data = await res.json();
          setPlanPrice(data.planPrice || 27);
        }
      } catch (err) {
        console.error('Error al obtener el precio del plan:', err);
      }
    };
    fetchPrice();
  }, []);

  const handleHeroCTA = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={landingWrapperStyle}>
      
      {/* Custom Landing Nav */}
      <nav style={landingNavStyle}>
        <div className="container" style={navContainerStyle}>
          <div style={logoAreaStyle}>
            <div style={logoWrapperStyle}>
              <img src="/logo.jpeg" alt="ContaClaridad Logo" style={logoImgStyle} />
            </div>
            <span style={logoTextStyle}>Conta<span style={{ color: 'var(--secondary)' }}>Claridad</span></span>
          </div>
          
          <div style={navButtonsStyle}>
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                <span>Mi Panel de Control</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <Link to="/login" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Iniciar Sesión</Link>
                <button onClick={() => navigate('/register')} className="btn btn-primary">
                  Comenzar
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div className="container grid-2" style={{ alignItems: 'center' }}>
          <div className="animated-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={heroBadgeStyle}>
              <Sparkles size={14} color="var(--secondary)" />
              <span>Primer Módulo de Utilidades Automatizado</span>
            </div>
            <h1 style={heroTitleStyle}>Lleva la contabilidad de tu pyme con <span style={{ color: 'var(--primary-dark)' }}>claridad absoluta</span></h1>
            <p style={heroSubStyle}>
              ContaClaridad ayuda a los emprendedores a entender sus finanzas reales. Registra tus ingresos, costos y gastos de forma automatizada, y descubre cuál es tu **Utilidad de cada mes** en un Estado de Resultados profesional.
            </p>
            <div style={heroCtaAreaStyle}>
              <button onClick={handleHeroCTA} className="btn btn-success" style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
                {user ? <span>Ir a mi Panel de Control</span> : <span>Registrar mi Negocio</span>}
                <ArrowRight size={18} />
              </button>
              {!user && (
                <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '16px 24px' }}>
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
          
          {/* Hero Image wrapper (featuring the mascot logo) */}
          <div className="animated-fade-in" style={heroImgAreaStyle}>
            <div style={mascotCardStyle}>
              <div style={mascotImgContainerStyle}>
                <img src="/claridad imagen 2.png" alt="Mascota ContaClaridad" style={mascotImgStyle} />
              </div>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Hola, soy Clara</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  "Te guiaré paso a paso para calcular tu utilidad neta mensual sin tecnicismos."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Section: Qué puedes encontrar */}
      <section style={introSectionStyle}>
        <div className="container grid-2" style={{ alignItems: 'center', gap: '40px' }}>
          {/* Left: Mascot Image */}
          <div style={introImgWrapperStyle}>
            <img src="/claridad imagen 1.png" alt="Logotipo ContaClaridad" style={introImgStyle} />
          </div>
          {/* Right: List of Concepts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.2' }}>
              ¿Qué puedes encontrar en <span style={{ color: 'var(--primary-dark)' }}>ContaClaridad</span>?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.5' }}>
              Te ofrecemos la <strong>definición clara</strong> y <strong>ejemplos prácticos</strong> de:
            </p>
            <ul style={introListStyle}>
              <li style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                <span style={introBulletStyle}>•</span>
                <strong>INGRESOS</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                <span style={introBulletStyle}>•</span>
                <strong>COSTOS</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                <span style={introBulletStyle}>•</span>
                <strong>GASTOS</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                <span style={introBulletStyle}>•</span>
                <strong>UTILIDAD</strong>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                <span style={introBulletStyle}>•</span>
                <strong>ESTADO DE RESULTADO</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 1: Conceptos Financieros Básicos */}
      <section style={sectionStyle}>
        <div className="container">
          <div style={sectionHeaderStyle}>
            <div style={iconBadgeStyle}>
              <BookOpen size={16} />
              <span>Aprende con ContaClaridad</span>
            </div>
            <h2 style={sectionTitleStyle}>¿Cómo se calcula tu ganancia real?</h2>
            <p style={sectionSubStyle}>
              El Word *Propuesta de ContaClaridad* nos enseña los conceptos básicos que toda pequeña empresa debe conocer:
            </p>
          </div>

          {/* Interactive tabs */}
          <div style={tabContainerStyle} className="card">
            <div style={tabHeadersStyle}>
              <button 
                onClick={() => setActiveTab('ingresos')} 
                style={{...tabHeaderButtonStyle, ...(activeTab === 'ingresos' ? activeTabStyle : {})}}
              >
                <TrendingUp size={16} />
                <span>Ingresos</span>
              </button>
              <button 
                onClick={() => setActiveTab('costos')} 
                style={{...tabHeaderButtonStyle, ...(activeTab === 'costos' ? activeTabStyle : {})}}
              >
                <TrendingDown size={16} />
                <span>Costos</span>
              </button>
              <button 
                onClick={() => setActiveTab('gastos')} 
                style={{...tabHeaderButtonStyle, ...(activeTab === 'gastos' ? activeTabStyle : {})}}
              >
                <TrendingDown size={16} />
                <span>Gastos</span>
              </button>
              <button 
                onClick={() => setActiveTab('utilidad')} 
                style={{...tabHeaderButtonStyle, ...(activeTab === 'utilidad' ? activeTabStyle : {})}}
              >
                <DollarSign size={16} />
                <span>Utilidad Neta</span>
              </button>
            </div>

            {/* Tab content */}
            <div style={tabContentStyle}>
              {activeTab === 'ingresos' && (
                <div className="animated-fade-in" style={tabInnerStyle}>
                  <div style={tabTextPaneStyle}>
                    <h3 style={tabTitleStyle}>¿Qué son los Ingresos?</h3>
                    <p style={tabDescStyle}>
                      Es el dinero que una empresa recibe por vender productos o prestar servicios. Es la entrada principal que permite operar el negocio.
                    </p>
                    <div style={exampleCardStyle}>
                      <span style={exampleBadgeStyle}>Ejemplo del Word:</span>
                      <p style={{ marginTop: '8px' }}>
                        Una tienda vende <strong>100 camisetas</strong> a <strong>RD$ 500</strong> cada una.
                      </p>
                      <div style={mathFormulaStyle}>
                        Ingresos = 100 × RD$ 500 = <strong style={{ color: 'var(--primary-dark)' }}>RD$ 50,000.00</strong>
                      </div>
                    </div>
                  </div>
                  <div style={tabVisualPaneStyle}>
                    <TrendingUp size={120} color="var(--primary)" style={{ opacity: 0.15 }} />
                  </div>
                </div>
              )}

              {activeTab === 'costos' && (
                <div className="animated-fade-in" style={tabInnerStyle}>
                  <div style={tabTextPaneStyle}>
                    <h3 style={tabTitleStyle}>¿Qué son los Costos?</h3>
                    <p style={tabDescStyle}>
                      Son los desembolsos directamente relacionados con la producción o adquisición de lo que se vende. Si no produces o no compras mercancía, no incurres en este costo.
                    </p>
                    <div style={exampleCardStyle}>
                      <span style={exampleBadgeStyle}>Ejemplo del Word:</span>
                      <p style={{ marginTop: '8px' }}>
                        La tienda compró las <strong>100 camisetas</strong> a un proveedor por <strong>RD$ 300</strong> cada una.
                      </p>
                      <div style={mathFormulaStyle}>
                        Costos = 100 × RD$ 300 = <strong style={{ color: 'var(--accent-red)' }}>RD$ 30,000.00</strong>
                      </div>
                      <p style={{ marginTop: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Al restar tus Costos (<strong>RD$ 30,000.00</strong>) de tus Ingresos (<strong>RD$ 50,000.00</strong>), te quedan <strong>RD$ 20,000.00</strong> de <strong>Utilidad Bruta</strong>.
                      </p>
                    </div>
                  </div>
                  <div style={tabVisualPaneStyle}>
                    <TrendingDown size={120} color="var(--accent-red)" style={{ opacity: 0.15 }} />
                  </div>
                </div>
              )}

              {activeTab === 'gastos' && (
                <div className="animated-fade-in" style={tabInnerStyle}>
                  <div style={tabTextPaneStyle}>
                    <h3 style={tabTitleStyle}>¿Qué son los Gastos?</h3>
                    <p style={tabDescStyle}>
                      Son los desembolsos necesarios para operar el negocio o empresa, pero que no forman parte directa de la fabricación o adquisición del producto vendido.
                    </p>
                    <div style={exampleCardStyle}>
                      <span style={exampleBadgeStyle}>Ejemplos del Word:</span>
                      <ul style={exampleListStyle}>
                        <li>🏠 Alquiler del local: <strong>RD$ 3,000.00</strong></li>
                        <li>⚡ Electricidad: <strong>RD$ 1,000.00</strong></li>
                        <li>📣 Publicidad: <strong>RD$ 2,000.00</strong></li>
                        <li>👥 Sueldos: <strong>RD$ 2,000.00</strong></li>
                        <li>🏦 Intereses Bancarios: <strong>RD$ 500.00</strong></li>
                        <li>⚖️ Impuestos mensuales: <strong>RD$ 1,000.00</strong></li>
                      </ul>
                      <div style={mathFormulaStyle}>
                        Total de Gastos (Operativos + Financieros + Impuestos) = <strong style={{ color: 'var(--secondary)' }}>RD$ 9,500.00</strong>
                      </div>
                      <p style={{ marginTop: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        Estos gastos se irán restando de los <strong>RD$ 20,000.00</strong> que te quedaron de Utilidad Bruta, de modo que puedas conocer tu Utilidad Operativa y, tras restar intereses e impuestos, tu Utilidad Neta final.
                      </p>
                    </div>
                  </div>
                  <div style={tabVisualPaneStyle}>
                    <TrendingDown size={120} color="var(--secondary)" style={{ opacity: 0.15 }} />
                  </div>
                </div>
              )}

              {activeTab === 'utilidad' && (
                <div className="animated-fade-in" style={tabInnerStyle}>
                  <div style={tabTextPaneStyle}>
                    <h3 style={tabTitleStyle}>¿Qué es la Utilidad Neta?</h3>
                    <p style={tabDescStyle}>
                      Es la ganancia real que obtiene una empresa o persona después de descontar todos los costos, gastos de operación, impuestos e intereses. Es el beneficio final líquido disponible.
                    </p>
                    <div style={exampleCardStyle}>
                      <span style={exampleBadgeStyle}>Fórmula Contable:</span>
                      <div style={mathFormulaStyle}>
                        Utilidad Neta = Ingresos − Costos − Gastos − Intereses − Impuestos
                      </div>
                      <p style={{ marginTop: '8px' }}>
                        Con las cifras del caso práctico:
                      </p>
                      <div style={mathFormulaStyle}>
                        RD$ 50,000.00 − RD$ 30,000.00 − RD$ 8,000.00 − RD$ 500.00 − RD$ 1,000.00 = <strong style={{ color: 'var(--accent-green)' }}>RD$ 10,500.00</strong>
                      </div>
                    </div>
                  </div>
                  <div style={tabVisualPaneStyle}>
                    <DollarSign size={120} color="var(--accent-green)" style={{ opacity: 0.15 }} />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Section 2: El Estado de Resultados Completo */}
      <section style={{...sectionStyle, background: 'rgba(1, 128, 129, 0.03)'}}>
        <div className="container grid-2" style={{ alignItems: 'center', gap: '40px' }}>
          
          {/* Explanation Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={iconBadgeStyle}>
              <Calculator size={16} />
              <span>Cálculo Automatizado</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>El Estado de Resultados</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              En contabilidad, las cifras se agrupan en una estructura estándar llamada **Estado de Resultados** (o reporte de Pérdidas y Ganancias). 
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Esta tabla te muestra cómo los ingresos se van depurando paso a paso (restando costos y luego gastos) para dar con la Utilidad Bruta, Utilidad Operativa y, finalmente, la Utilidad Neta.
            </p>
            <div style={{ ...exampleCardStyle, background: 'var(--bg-card)' }}>
              <p style={{ fontWeight: '700', color: 'var(--text-primary)' }}>💡 En ContaClaridad:</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Tú solo ingresas las facturas y pagos del mes. El sistema clasifica las categorías, multiplica cantidades por precios y genera este reporte contable de forma automática.
              </p>
            </div>
          </div>

          {/* Table Exhibit */}
          <div className="card" style={{ padding: '24px', background: 'white' }}>
            <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '12px', marginBottom: '16px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', letterSpacing: '0.02em' }}>EJEMPLO DE ESTADO DE RESULTADOS</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Caso Práctico: 100 Camisetas (RD$)</span>
            </div>

            <div style={tableSheetStyle}>
              <div style={tableRowStyle}>
                <span>Ventas (Ingresos)</span>
                <span style={tableValStyle}>50,000.00</span>
              </div>
              <div style={tableRowStyle}>
                <span>(-) Costo de ventas</span>
                <span style={{...tableValStyle, color: 'var(--accent-red)'}}>(30,000.00)</span>
              </div>
              <div style={{...tableRowStyle, fontWeight: '700', background: 'rgba(254, 237, 179, 0.3)'}}>
                <span>Utilidad bruta</span>
                <span style={{...tableValStyle, color: 'var(--accent-green)'}}>20,000.00</span>
              </div>
              <div style={tableRowStyle}>
                <span>(-) Gastos operativos</span>
                <span style={{...tableValStyle, color: 'var(--accent-red)'}}>(8,000.00)</span>
              </div>
              <div style={{...tableRowStyle, fontWeight: '700', background: 'rgba(254, 237, 179, 0.3)'}}>
                <span>Utilidad operativa</span>
                <span style={{...tableValStyle, color: 'var(--accent-green)'}}>12,000.00</span>
              </div>
              <div style={tableRowStyle}>
                <span>(-) Gastos por intereses</span>
                <span style={{...tableValStyle, color: 'var(--accent-red)'}}>(500.00)</span>
              </div>
              <div style={{...tableRowStyle, fontWeight: '700'}}>
                <span>Utilidad antes de impuestos</span>
                <span style={tableValStyle}>11,500.00</span>
              </div>
              <div style={tableRowStyle}>
                <span>(-) Impuestos</span>
                <span style={{...tableValStyle, color: 'var(--accent-red)'}}>(1,000.00)</span>
              </div>
              <div style={tableFinalRowStyle}>
                <span>Utilidad neta</span>
                <span style={{...tableValStyle, color: 'var(--accent-green)', fontSize: '1.1rem'}}>10,500.00</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing/Feature Tiers */}
      <section style={sectionStyle}>
        <div className="container">
          <div style={sectionHeaderStyle}>
            <div style={iconBadgeStyle}>
              <Sparkles size={16} />
              <span>Planes Disponibles</span>
            </div>
            <h2 style={sectionTitleStyle}>Comienza a medir tu utilidad hoy</h2>
            <p style={sectionSubStyle}>
              Accede a todas las herramientas contables avanzadas con nuestra suscripción mensual.
            </p>
          </div>

          <div style={pricingGridStyle}>
            
            {/* Premium Plan */}
            <div className="card" style={{...pricingCardStyle, border: '2px solid var(--secondary)', boxShadow: '0 15px 35px -5px rgba(255,165,3,0.15)', maxWidth: '440px', width: '100%'}}>
              <div style={premiumTagStyle}>Recomendado</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{...planTitleStyle, color: 'var(--secondary)'}}>Plan Premium</span>
                  <Sparkles size={16} color="var(--secondary)" />
                </div>
                <div style={priceContainerStyle}>
                  <span style={priceSymbolStyle}>$</span>
                  <span style={priceAmountStyle}>{planPrice}</span>
                  <span style={pricePeriodStyle}>USD / mes</span>
                </div>
                <p style={planDescStyle}>El plan único para dueños de negocio que necesitan claridad total en su utilidad neta, estado de resultados e impuestos.</p>
              </div>

              <div style={planFeaturesStyle}>
                <div style={featureItemStyle}><CheckCircle2 size={16} color="var(--secondary)" /> <span>Registro de Ingresos, Costos y Gastos ilimitados</span></div>
                <div style={featureItemStyle}><CheckCircle2 size={16} color="var(--secondary)" /> <span>Cálculo automático de Utilidad Bruta</span></div>
                <div style={featureItemStyle}><CheckCircle2 size={16} color="var(--secondary)" /> <strong>Estado de Resultados automático</strong></div>
                <div style={featureItemStyle}><CheckCircle2 size={16} color="var(--secondary)" /> <strong>Cálculo de Utilidad Operativa y Neta</strong></div>
                <div style={featureItemStyle}><CheckCircle2 size={16} color="var(--secondary)" /> <span>Desglose por categoría de gastos</span></div>
                <div style={featureItemStyle}><CheckCircle2 size={16} color="var(--secondary)" /> <span>Opción para imprimir y exportar reportes</span></div>
              </div>

              <button onClick={() => navigate('/register')} className="btn btn-premium" style={{ width: '100%', padding: '14px' }}>
                Suscribirse a Premium
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer style={footerStyle}>
        <div className="container" style={footerContainerStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ color: 'white', fontSize: '1.4rem' }}>¿Listo para saber cuál es tu utilidad real?</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              No esperes al final del año para saber si ganaste dinero. Regístrate en ContaClaridad.
            </p>
          </div>
          <button onClick={handleHeroCTA} className="btn btn-success" style={{ padding: '14px 28px' }}>
            <span>Registrar mi negocio ahora</span>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="container" style={copyrightStyle}>
          <p>© {new Date().getFullYear()} ContaClaridad S.R.L. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
};

// Styles for Marketing Landing Page
const landingWrapperStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column'
};

const landingNavStyle = {
  background: 'rgba(255, 253, 242, 0.9)',
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid var(--border-color)',
  padding: '16px 0',
  position: 'sticky',
  top: 0,
  zIndex: 100
};

const navContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const logoAreaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const logoWrapperStyle = {
  width: '34px',
  height: '34px',
  borderRadius: '50%',
  overflow: 'hidden',
  border: '2px solid var(--primary)'
};

const logoImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const logoTextStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '1.2rem',
  fontWeight: '800',
  letterSpacing: '-0.02em',
  color: 'var(--text-primary)'
};

const navButtonsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px'
};

const heroSectionStyle = {
  padding: '80px 0 100px 0',
  background: 'radial-gradient(circle at 80% 20%, rgba(254, 237, 179, 0.25) 0%, transparent 60%)'
};

const heroBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(255, 165, 3, 0.12)',
  color: '#d68700',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '0.78rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  alignSelf: 'flex-start'
};

const heroTitleStyle = {
  fontSize: '2.8rem',
  fontWeight: '800',
  lineHeight: '1.15',
  letterSpacing: '-0.03em'
};

const heroSubStyle = {
  fontSize: '1.05rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
  maxWidth: '520px'
};

const heroCtaAreaStyle = {
  display: 'flex',
  gap: '16px',
  marginTop: '10px',
  flexWrap: 'wrap'
};

const heroImgAreaStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative'
};

const mascotCardStyle = {
  background: 'white',
  border: '1px solid var(--border-color)',
  borderRadius: '20px',
  boxShadow: 'var(--shadow-lg)',
  width: '100%',
  maxWidth: '455px',
  overflow: 'hidden',
  transform: 'rotate(2deg)',
  transition: 'var(--transition-normal)'
};

const mascotImgContainerStyle = {
  width: '100%',
  background: 'rgba(254, 237, 179, 0.2)'
};

const mascotImgStyle = {
  width: '100%',
  height: 'auto',
  objectFit: 'contain',
  display: 'block'
};

const sectionStyle = {
  padding: '100px 0'
};

const sectionHeaderStyle = {
  textAlign: 'center',
  maxWidth: '600px',
  margin: '0 auto 50px auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px'
};

const iconBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'var(--primary-glow)',
  color: 'var(--primary)',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '0.8rem',
  fontWeight: '700',
  textTransform: 'uppercase'
};

const sectionTitleStyle = {
  fontSize: '2.2rem',
  fontWeight: '800',
  letterSpacing: '-0.02em'
};

const sectionSubStyle = {
  color: 'var(--text-secondary)',
  fontSize: '0.95rem',
  lineHeight: '1.5'
};

/* Tabs Styling */
const tabContainerStyle = {
  maxWidth: '850px',
  margin: '0 auto',
  background: 'white',
  padding: '24px',
  borderRadius: '16px'
};

const tabHeadersStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '10px',
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '16px',
  marginBottom: '24px'
};

const tabHeaderButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  background: 'none',
  border: '1px solid transparent',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'var(--transition-fast)'
};

const activeTabStyle = {
  background: 'var(--primary-glow)',
  borderColor: 'var(--primary)',
  color: 'var(--primary)'
};

const tabContentStyle = {
  minHeight: '260px'
};

const tabInnerStyle = {
  display: 'grid',
  gridTemplateColumns: '1.8fr 1fr',
  gap: '24px',
  alignItems: 'center'
};

const tabTextPaneStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const tabVisualPaneStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const tabTitleStyle = {
  fontSize: '1.4rem',
  fontWeight: '700'
};

const tabDescStyle = {
  color: 'var(--text-secondary)',
  lineHeight: '1.6',
  fontSize: '0.95rem'
};

const exampleCardStyle = {
  background: '#FFFDF2',
  borderLeft: '4px solid var(--secondary)',
  padding: '16px',
  borderRadius: '0 8px 8px 0',
  marginTop: '8px'
};

const exampleBadgeStyle = {
  fontSize: '0.75rem',
  fontWeight: '800',
  textTransform: 'uppercase',
  color: 'var(--secondary)'
};

const exampleListStyle = {
  listStyleType: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginTop: '6px',
  fontSize: '0.88rem'
};

const mathFormulaStyle = {
  background: 'rgba(1, 128, 129, 0.05)',
  border: '1px dashed var(--primary)',
  padding: '10px 14px',
  borderRadius: '6px',
  fontFamily: 'var(--font-heading)',
  fontSize: '0.95rem',
  fontWeight: '700',
  marginTop: '12px',
  display: 'inline-block'
};

/* Table Exhibit styles */
const tableSheetStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0'
};

const tableRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 8px',
  borderBottom: '1px solid var(--border-color)',
  fontSize: '0.88rem',
  color: 'var(--text-secondary)'
};

const tableValStyle = {
  fontWeight: '600',
  fontFamily: 'var(--font-heading)'
};

const tableFinalRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '14px 8px',
  fontWeight: '800',
  borderTop: '2px solid var(--primary)',
  borderBottom: '3px double var(--primary)',
  background: 'var(--primary-glow)',
  marginTop: '8px'
};

/* Pricing Styles */
const pricingGridStyle = {
  display: 'flex',
  justifyContent: 'center',
  maxWidth: '450px',
  margin: '0 auto',
  alignItems: 'stretch',
  width: '100%'
};

const pricingCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: 'white',
  padding: '40px 32px',
  borderRadius: '20px',
  position: 'relative',
  gap: '24px'
};

const premiumTagStyle = {
  position: 'absolute',
  top: '-12px',
  right: '24px',
  background: 'var(--secondary)',
  color: 'white',
  fontSize: '0.75rem',
  fontWeight: '800',
  padding: '4px 12px',
  borderRadius: '20px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const planTitleStyle = {
  fontSize: '1.25rem',
  fontWeight: '800',
  color: 'var(--text-primary)'
};

const priceContainerStyle = {
  display: 'flex',
  alignItems: 'baseline',
  margin: '8px 0'
};

const priceSymbolStyle = {
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  marginRight: '2px'
};

const priceAmountStyle = {
  fontSize: '2.5rem',
  fontWeight: '800',
  letterSpacing: '-0.03em',
  color: 'var(--text-primary)',
  lineHeight: '1'
};

const pricePeriodStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  marginLeft: '4px'
};

const planDescStyle = {
  fontSize: '0.88rem',
  color: 'var(--text-secondary)',
  lineHeight: '1.4'
};

const planFeaturesStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  flex: 1
};

const featureItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '0.88rem',
  color: 'var(--text-primary)'
};

/* Footer Styles */
const footerStyle = {
  background: 'var(--primary-dark)',
  color: 'white',
  padding: '60px 0 30px 0',
  marginTop: 'auto'
};

const footerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  paddingBottom: '40px',
  flexWrap: 'wrap',
  gap: '24px'
};

const copyrightStyle = {
  paddingTop: '24px',
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.5)',
  textAlign: 'center'
};

const introSectionStyle = {
  padding: '60px 0',
  borderBottom: '1px solid var(--border-color)',
  background: 'rgba(254, 237, 179, 0.15)'
};

const introImgWrapperStyle = {
  width: '100%',
  maxWidth: '400px',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
  border: '3px solid var(--primary)',
  justifySelf: 'center'
};

const introImgStyle = {
  width: '100%',
  height: 'auto',
  display: 'block',
  objectFit: 'cover'
};

const introListStyle = {
  listStyleType: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const introBulletStyle = {
  color: 'var(--secondary)',
  fontWeight: '800',
  fontSize: '1.3rem',
  marginRight: '10px',
  lineHeight: '1'
};

export default Landing;
