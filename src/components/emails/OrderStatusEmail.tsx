import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Tailwind, Hr } from "@react-email/components";
import * as React from "react";

interface OrderStatusEmailProps {
  nombreCliente: string;
  nombreNegocio: string;
  idPedido: number;
  nuevoEstado: string; // "En_Preparaci_n", "Listo_para_recoger", etc.
}

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const OrderStatusEmail = ({
  nombreCliente,
  nombreNegocio,
  idPedido,
  nuevoEstado,
}: OrderStatusEmailProps) => {
  
  // --- Lógica de Mensajes Dinámicos ---
  let titulo = "Actualización de tu pedido";
  let mensaje = "El estado de tu pedido ha cambiado.";
  let color = "text-stone-800";
  let bgColor = "bg-stone-800";

  switch (nuevoEstado) {
    case "En_Preparaci_n":
        titulo = "¡Tu pedido está en proceso! ✨";
        mensaje = `${nombreNegocio} ha comenzado a preparar tus productos.`;
        color = "text-blue-600";
        bgColor = "bg-blue-600";
        break;
    case "Listo_para_recoger":
        titulo = "¡Pasa a recogerlo! 🛍️";
        mensaje = `Tu pedido en ${nombreNegocio} está listo. ¡No olvides tu número de orden!`;
        color = "text-green-600";
        bgColor = "bg-green-600";
        break;
    case "Entregado":
        titulo = "Pedido Entregado ✅";
        mensaje = "Esperamos que disfrutes tu compra. ¡Gracias por apoyar el comercio local!";
        color = "text-stone-600";
        bgColor = "bg-stone-600";
        break;
    case "Cancelado":
        titulo = "Pedido Cancelado ❌";
        mensaje = `Lo sentimos, ${nombreNegocio} ha tenido que cancelar tu pedido.`;
        color = "text-red-600";
        bgColor = "bg-red-600";
        break;
  }

  const previewText = `${titulo} - Pedido #${idPedido}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-stone-50 font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded-3xl border border-solid border-stone-200 bg-white p-[20px]">
            
            <Section className="mt-[32px] text-center">
              <div className="text-xl font-bold text-stone-300">Manos Tonilenses</div>
            </Section>

            <Heading className={`mx-0 my-[30px] p-0 text-center text-[24px] font-bold ${color}`}>
              {titulo}
            </Heading>

            <Text className="text-[16px] leading-[24px] text-stone-700 text-center">
              Hola <strong>{nombreCliente}</strong>,
            </Text>
            
            <Text className="text-[16px] leading-[24px] text-stone-600 text-center mb-6">
              {mensaje}
            </Text>

            <Section className="text-center my-6">
                <div className="inline-block bg-stone-100 px-4 py-2 rounded-lg border border-stone-200">
                    <Text className="m-0 text-sm font-bold text-stone-500 uppercase tracking-widest">
                        Orden #{idPedido}
                    </Text>
                </div>
            </Section>

            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                className={`rounded-full px-6 py-4 text-center text-[14px] font-bold text-white no-underline shadow-md ${bgColor}`}
                href={`${baseUrl}/perfil`}
              >
                Ver detalles del pedido
              </Button>
            </Section>

            <Hr className="mx-0 my-[26px] w-full border border-solid border-stone-200" />
            <Text className="text-[12px] leading-[24px] text-stone-400 text-center">
              Si tienes dudas, contacta directamente al negocio.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrderStatusEmail;