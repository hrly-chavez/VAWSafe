import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LegalAgreement({ setLegalAccepted }) {
  const [language, setLanguage] = useState("english");
  const navigate = useNavigate();

  const handleAccept = () => setLegalAccepted(true);
  const handleDecline = () => navigate("/social_worker");
  const buttonLabels = {
    english: {
      accept: "Accept & Proceed",
      decline: "Decline",
    },
    bisaya: {
      accept: "Dawat ug Padayon",
      decline: "Dili Modayon",
    },
    tagalog: {
      accept: "Tanggapin at Magpatuloy",
      decline: "Tanggihan",
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div
        className="bg-white rounded-xl p-8 w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-scroll"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-blue-800">
            {language === "bisaya"
              ? "PORMULARYO SA TUGOT SA PAGGAMIT SA PERSONAL NGA IMPORMASYON"
              : language === "tagalog"
                ? "PAHINTULOT SA PAGGAMIT NG PERSONAL NA IMPORMASYON"
                : "DATA PRIVACY CONSENT FORM"}
          </h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-gray-300 rounded px-3 py-1 text-gray-800 bg-white shadow-sm focus:outline-none"
          >
            <option disabled value="select">Select Language</option>
            <option value="english">English</option>
            <option value="bisaya">Bisaya</option>
            <option value="tagalog">Tagalog</option>
          </select>
        </div>

        <hr className="border-gray-300 mb-4" />

        {/* Institution Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong className="text-blue-800">REGIONAL HAVEN FOR WOMEN</strong><br />
            Camomot Franza Road, Katipunan St., Labangon, Cebu City
          </p>
        </div>

        {/* Consent Content */}
        <div className="text-sm text-gray-800 space-y-4 leading-relaxed">
          {language === "bisaya" ? (
            <>
              <p>
                Uyon sa Republic Act No. 10173 o Data Privacy Act of 2012, boluntaryo ug tibuok ko nga nagtugot sa koleksyon, paggamit, ug pagproseso sa akong personal ug sensitibong impormasyon alang sa katuyuan sa paghatag sa angay nga serbisyo, suporta, referral, ug dokumentasyon.
              </p>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  IMPORMASYON NGA POSIBLENG KOLEKTAHON:
                </p>
              </div>
              <ul className="list-disc pl-5">
                <li>Buong pangalan, petsa sa pagkatawo, edad, kasarian, ug address</li>
                <li>Kontak nga impormasyon (numero sa cellphone, email)</li>
                <li>Sibil nga kahimtang ug impormasyon sa pamilya</li>
                <li>Mga ID nga gi-isyu sa gobyerno (e.g., birth certificate, ID number)</li>
                <li>Medikal, sikolohikal, edukasyonal, legal, o sosyal nga impormasyon</li>
                <li>Uban pa nga datos nga may kalabutan sa serbisyo</li>
              </ul>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  KATUYUAN SA PAGKOLEKTA UG PAGGAMIT:
                </p>
              </div>
              <ul className="list-disc pl-5">
                <li>Aron mahatagan ug husto nga serbisyo, interbensyon, o referral</li>
                <li>Para sa dokumentasyon sa kaso, report, monitoring, ug evaluation</li>
                <li>Para sa komunikasyon ug koordinasyon sa partner agencies</li>
                <li>Para sa pagsunod sa legal o regulasyon nga mga rekisito</li>
                <li>Para sa internal nga pagtipig sa rekord ug pag-analisar sa datos</li>
              </ul>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  PAGPAAMBIT UG PROTEKSYON SA DATOS:
                </p>
              </div>
              <ul className="list-decimal pl-5">
                <li>Ang datos pagatipigan sa luwas nga paagi ug ma-access lamang sa awtorisado nga personnel.</li>
                <li>Dili ipaambit sa dili awtorisado nga tawo o ahensya.</li>
                <li>Kung ipaambit sa ubang ahensya, buhaton kini nga adunay hustong panalipod ug klarong katuyoan.</li>
                <li>Ang mga katungod ubos sa Data Privacy Act girespeto ug gitugotan.</li>
              </ul>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  DEKLARASYON SA PAGTUGOT:
                </p>
              </div>
              <p>
                Gikumpirma nako nga nabasa ug nasabtan ang sulod sa pormularyo. Boluntaryo ko nga gihatag ang pagtugot sa pagkolekta, paggamit, ug pagproseso sa akong impormasyon alang sa mga tinud-anay nga katuyuan. Nasayod ko nga pwede ko bawi-on ang pagtugot bisan kanus-a pinaagi sa pormal nga pahibalo.
              </p>
            </>
          ) : language === "tagalog" ? (
            <>
              <p>
                Alinsunod sa Republic Act No. 10173 o Data Privacy Act of 2012, ako ay kusang-loob at malayang nagbibigay ng pahintulot sa pagkolekta, paggamit, at pagproseso ng aking personal at sensitibong impormasyon para sa layunin ng pagbibigay ng nararapat na serbisyo, suporta, referral, at dokumentasyon.
              </p>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  IMPORMASYONG MAARING KOLEKTAHIN:
                </p>
              </div>
              <ul className="list-disc pl-5">
                <li>Buong pangalan, petsa ng kapanganakan, edad, kasarian, at address</li>
                <li>Impormasyon sa pakikipag-ugnayan (mobile number, email)</li>
                <li>Katayuang sibil at impormasyon tungkol sa pamilya</li>
                <li>Mga dokumentong inisyu ng gobyerno (hal. birth certificate, ID number)</li>
                <li>Medikal, sikolohikal, edukasyonal, legal, o impormasyong may kaugnayan sa kaso</li>
                <li>Iba pang personal o sensitibong datos na may kaugnayan sa serbisyong ibinibigay</li>
              </ul>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  LAYUNIN NG PAGKOLEKTA AT PAGGAMIT:
                </p>
              </div>
              <ul className="list-disc pl-5">
                <li>Upang masuri at maibigay ang nararapat na serbisyo, interbensyon, o referral</li>
                <li>Para sa dokumentasyon ng kaso, pag-uulat, monitoring, at ebalwasyon</li>
                <li>Para sa komunikasyon at koordinasyon sa mga katuwang na ahensya</li>
                <li>Para sa pagsunod sa mga legal o regulasyong kinakailangan</li>
                <li>Para sa panloob na pagtatago ng rekord at pagsusuri ng datos</li>
              </ul>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  PAGBABAHAGI AT PROTEKSYON NG DATOS:
                </p>
              </div>
              <ul className="list-decimal pl-5">
                <li>Ang aking datos ay itatago sa ligtas na paraan at maa-access lamang ng awtorisadong tauhan.</li>
                <li>Ang aking impormasyon ay hindi ibabahagi sa hindi awtorisadong tao o ahensya.</li>
                <li>Kung may pagbabahagi ng datos sa ibang ahensya, ito ay gagawin lamang na may sapat na proteksyon at malinaw na layunin.</li>
                <li>Ang aking mga karapatan sa ilalim ng Data Privacy Act of 2012, kabilang ang karapatang makita, itama, at bawiin ang pahintulot, ay kinikilala at iginagalang.</li>
              </ul>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  PAGPAPAHAYAG NG PAHINTULOT:
                </p>
              </div>
              <p>
                Kumpirmado kong nabasa at naunawaan ko ang nilalaman ng form na ito. Kusang-loob at may kaalaman kong ibinibigay ang aking pahintulot sa pagkolekta, paggamit, at pagproseso ng aking personal at sensitibong impormasyon para sa mga layuning nakasaad sa itaas. Nauunawaan ko rin na maaari kong bawiin ang pahintulot na ito anumang oras sa pamamagitan ng pagsusumite ng nakasulat na abiso sa institusyon.
              </p>
            </>
          ) : (
            <>
              <p>
                Pursuant to Republic Act No. 10173 or the Data Privacy Act of 2012, I voluntarily and freely give my full consent to the collection, use, and processing of my personal and sensitive information for the purpose of providing appropriate services, support, referrals, and documentation.
              </p>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  PERSONAL DATA THAT MAY BE COLLECTED:
                </p>
              </div>
              <ul className="list-disc pl-5">
                <li>Full name, date of birth, age, sex, and address</li>
                <li>Contact information (mobile, email)</li>
                <li>Civil status, family background</li>
                <li>Government-issued IDs or documents (e.g., birth certificate, ID numbers)</li>
                <li>Medical, psychological, educational, legal, or social case-related information</li>
                <li>Any other personal or sensitive data relevant to the services being provided</li>
              </ul>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  PURPOSE OF DATA COLLECTION AND USE:
                </p>
              </div>
              <ul className="list-disc pl-5">
                <li>To assess and provide appropriate services, interventions, or referrals</li>
                <li>For case documentation, reporting, monitoring, and evaluation</li>
                <li>For communication and coordination with partner agencies</li>
                <li>For compliance with legal or regulatory requirements</li>
                <li>For internal record-keeping and data analysis</li>
              </ul>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  DATA SHARING AND PROTECTION:
                </p>
              </div>
              <ul className="list-decimal pl-5">
                <li>My data will be stored securely and accessed only by authorized personnel.</li>
                <li>My personal information will not be shared with unauthorized persons or entities.</li>
                <li>Any data shared with third parties will be done only with proper safeguards and for valid service-related purposes.</li>
                <li>My rights under the Data Privacy Act of 2012, including the right to access, correct, and withdraw consent, are recognized and respected.</li>
              </ul>
              <div className="my-6">
                <hr className="border-gray-300 mb-2" />
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  DECLARATION OF CONSENT:
                </p>
              </div>
              <p>
                I confirm that I have read and understood the contents of this form. I freely and knowingly give my consent to the collection, use, and processing of my personal and sensitive information for the purposes stated above. I understand that I may withdraw this consent at any time by submitting a written notice to the institution.
              </p>
            </>
          )}
        </div>

        <hr className="border-gray-300 my-6" />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md border border-gray-300 hover:bg-gray-300 transition"
          >
            {buttonLabels[language].decline}
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {buttonLabels[language].accept}
          </button>
        </div>
      </div>
    </div>
  );
}