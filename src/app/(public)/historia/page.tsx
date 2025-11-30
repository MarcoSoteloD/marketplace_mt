import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mountain, Sun, Church, BookOpen } from "lucide-react";

export const metadata = {
  title: "Historia de Tonila | Manos Tonilenses",
  description: "Conoce la historia, cultura y tradiciones del municipio de Tonila, Jalisco.",
};

const heroImageUrl = "/images/hero-tonila.jpg";

export default function HistoriaPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* --- HERO SECTION --- */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div
            className="relative bg-muted/40 py-16 md:py-24 min-h-[500px] overflow-hidden flex flex-col justify-center"
            style={{
              backgroundImage: `url('${heroImageUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          ></div>
        </div>

        <div className="relative z-10 container text-center text-white space-y-4 px-4">
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 border-orange-500/50 backdrop-blur-md">
            Municipio de Tonila, Jalisco
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            El Lugar Donde <br /> Nace el Sol
          </h1>
          <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Una tierra de tradición, custodiada por el Volcán de Fuego y enriquecida por su gente.
          </p>
        </div>
      </section>

      {/* --- ORIGEN Y SIGNIFICADO --- */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-orange-600 font-semibold">
              <Sun className="h-5 w-5" />
              <span>Etimología</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800">Tonillan</h2>
            <p className="text-stone-600 text-lg leading-relaxed">
              El nombre de <strong>Tonila</strong> proviene del vocablo náhuatl <em>&quot;Tonillan&quot;</em>.
              Se compone de <em>&quot;Tonilli&quot;</em> (lugar asoleado o calentado) y <em>&quot;Tlan&quot;</em> (lugar).
            </p>
            <p className="text-stone-600 text-lg leading-relaxed">
              Por ello, se traduce poéticamente como <strong>&quot;Lugar donde comienza a salir el sol&quot;</strong>.
              Esta denominación hace referencia a su ubicación geográfica privilegiada al oriente del
              Volcán de Fuego, recibiendo los primeros rayos del amanecer sobre el valle.
            </p>
          </div>
          <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl bg-stone-100">
            {/* Placeholder para imagen del amanecer o paisaje */}
            <div className="absolute inset-0 flex items-center justify-center bg-orange-50 text-orange-300">
              <Sun className="h-32 w-32 opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* --- CRONOLOGÍA --- */}
      <section className="py-16 md:py-24 bg-stone-50">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-800">Momentos Históricos</h2>
            <p className="text-stone-500 mt-2">Los eventos que forjaron nuestra identidad.</p>
          </div>

          <div className="space-y-8">
            {/* Evento 1 */}
            <Card className="border-l-4 border-l-orange-500 rounded-r-xl rounded-l-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <Badge variant="outline" className="font-bold">1524</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Conquista
                  </span>
                </div>
                <CardTitle className="text-xl text-stone-800">La llegada española</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600">
                  La región fue conquistada por el capitán <strong>Francisco Cortés de San Buenaventura</strong>.
                  Originalmente, estas tierras pertenecían al señorío de Zapotitlán y estaban habitadas por pueblos indígenas
                  que aprovechaban la fertilidad del suelo volcánico.
                </p>
              </CardContent>
            </Card>

            {/* Evento 2 */}
            <Card className="border-l-4 border-l-orange-500 rounded-r-xl rounded-l-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <Badge variant="outline" className="font-bold">1858</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Visita Ilustre
                  </span>
                </div>
                <CardTitle className="text-xl text-stone-800">El paso de Benito Juárez</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600">
                  Durante la Guerra de Reforma, el <strong>Benito Juárez</strong> se hospedó en Tonila
                  mientras se dirigía hacia el puerto de Manzanillo. La finca donde pernoctó se conserva como
                  un sitio de interés histórico local.
                </p>
              </CardContent>
            </Card>

            {/* Evento 3 */}
            <Card className="border-l-4 border-l-orange-500 rounded-r-xl rounded-l-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <Badge variant="outline" className="font-bold">Siglo XX</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Modernidad
                  </span>
                </div>
                <CardTitle className="text-xl text-stone-800">Constitución Municipal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600">
                  Tonila se consolidó como municipio libre, desarrollando su propia identidad administrativa y cultural.
                  Su economía floreció gracias a la agricultura (caña, maíz, café) y su posición estratégica en la carretera Guadalajara-Colima.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- PATRIMONIO Y CULTURA --- */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Volcán */}
            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-stone-50 hover:bg-stone-100 transition-colors">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-orange-600">
                <Mountain className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl text-stone-800 mb-2">El Guardián de Fuego</h3>
              <p className="text-stone-600 text-sm">
                Ubicado a las faldas del Volcán de Colima, Tonila ofrece paisajes espectaculares y suelos fértiles.
                Es un punto clave para el turismo de naturaleza y senderismo.
              </p>
            </div>

            {/* Arquitectura */}
            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-stone-50 hover:bg-stone-100 transition-colors">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-orange-600">
                <Church className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl text-stone-800 mb-2">Patrimonio Arquitectónico</h3>
              <p className="text-stone-600 text-sm">
                Destaca el Templo de Nuestra Señora de la Asunción y las haciendas históricas cercanas,
                que reflejan la época colonial y el auge agrícola de la región.
              </p>
            </div>

            {/* Tradiciones */}
            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-stone-50 hover:bg-stone-100 transition-colors">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-orange-600">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl text-stone-800 mb-2">Cultura Viva</h3>
              <p className="text-stone-600 text-sm">
                Sus fiestas patronales, su gastronomía local y la calidez de sus habitantes hacen de Tonila
                un lugar donde la tradición se vive día a día.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}