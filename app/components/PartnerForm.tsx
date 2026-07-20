"use client";

import { FormEvent } from "react";
import { Arrow } from "./Icons";

export default function PartnerForm() {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const pathway = String(data.get("pathway") ?? "Strategic Partnership");
    const organization = String(data.get("organization") ?? "");
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");
    const body = [
      `Partnership pathway: ${pathway}`,
      `Organization: ${organization}`,
      `Contact: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:info@humpbackenergy.com?subject=${encodeURIComponent(`Humpback Hydro | ${pathway}`)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="partner-form" onSubmit={submit}>
      <div className="field wide">
        <label htmlFor="pathway">Partnership Pathway</label>
        <select id="pathway" name="pathway" required defaultValue="Pilot or Site Opportunity">
          <option>Pilot or Site Opportunity</option>
          <option>Data-Center Power Opportunity</option>
          <option>Utility Integration</option>
          <option>Investment Partnership</option>
          <option>Engineering and Manufacturing</option>
          <option>Research and Validation</option>
        </select>
      </div>
      <div className="field"><label htmlFor="organization">Organization</label><input id="organization" name="organization" required /></div>
      <div className="field"><label htmlFor="name">Your Name</label><input id="name" name="name" required /></div>
      <div className="field wide"><label htmlFor="email">Work Email</label><input id="email" name="email" type="email" required /></div>
      <div className="field wide"><label htmlFor="message">Opportunity or Mandate</label><textarea id="message" name="message" rows={5} required placeholder="Tell us what you are trying to evaluate, fund, validate or deploy." /></div>
      <button className="button energy" type="submit">Prepare Email for Humpback <Arrow /></button>
      <small>This opens your email application with the information above. Nothing is stored by this concept site.</small>
    </form>
  );
}
