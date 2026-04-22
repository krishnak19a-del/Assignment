import pandas as pd
from fastapi import UploadFile
from sqlalchemy.orm import Session
from models import Household, HouseholdMember, FinancialProfile, BankDetail
from datetime import datetime, date
import re


def parse_excel(file: UploadFile):
    df = pd.read_excel(file.file)
    df = df.replace({float("nan"): None})
    df.columns = [normalize_key(col) for col in df.columns]
    return {
        "message": "Excel file uploaded and parsed successfully",
        "data": df.to_dict(orient="records"),
    }


def normalize_key(key: str) -> str:
    if not key:
        return ""
    return re.sub(r"[^a-z0-9]", "", key.lower())


def parse_date(value):
    if value is None:
        return None
    if isinstance(value, (date, datetime)):
        return value if isinstance(value, date) else value.date()
    if isinstance(value, str):
        for fmt in ["%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y"]:
            try:
                return datetime.strptime(value.strip(), fmt).date()
            except:
                continue
    return None


def parse_float(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value.replace(",", "").replace("$", ""))
        except:
            pass
    return None


def parse_int(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        try:
            return int(float(value.replace(",", "")))
        except:
            pass
    return None


def process_excel_data(db: Session, data: list):
    if not data:
        return {"message": "No data to process"}

    data = [{normalize_key(k): v for k, v in item.items()} for item in data]

    household_map = {}
    member_map = {}
    bank_map = {}

    for item in data:
        household_name = item.get("householdname") or ""
        ssn = str(item.get("ssn")) if item.get("ssn") else None
        account_no = str(item.get("accountno")) if item.get("accountno") else None

        if household_name and household_name not in household_map:
            existing = (
                db.query(Household).filter(Household.name == household_name).first()
            )
            if existing:
                household_map[household_name] = existing.id
            else:
                household = Household(name=household_name)
                db.add(household)
                db.flush()
                household_map[household_name] = household.id

        if ssn and ssn not in member_map:
            existing = (
                db.query(HouseholdMember).filter(HouseholdMember.ssn == ssn).first()
            )
            if existing:
                member_map[ssn] = existing.id
            else:
                member = HouseholdMember(
                    household_id=household_map.get(household_name),
                    first_name=item.get("firstname") or "",
                    last_name=item.get("lastname") or "",
                    date_of_birth=parse_date(item.get("dob")),
                    ssn=ssn,
                    phone=str(item.get("phone")) if item.get("phone") else None,
                    email=item.get("email") or "",
                    address=item.get("address") or "",
                    occupation=item.get("occupation") or "",
                    employer=item.get("employer") or "",
                    marital_status=item.get("maritalstatus") or "",
                    drivers_license_number=str(item.get("driverslicenseid"))
                    if item.get("driverslicenseid")
                    else None,
                    drivers_license_state=item.get("driverslicenseidstate") or "",
                    drivers_license_issue_date=parse_date(
                        item.get("driverslicenseidissuedate")
                    ),
                    drivers_license_expiration_date=parse_date(
                        item.get("driverslicenseidexpirationdate")
                    ),
                )
                db.add(member)
                db.flush()
                member_map[ssn] = member.id

        if account_no and account_no not in bank_map:
            existing = (
                db.query(BankDetail)
                .filter(BankDetail.account_number == account_no)
                .first()
            )
            if existing:
                bank_map[account_no] = existing.id
            else:
                bank_detail = BankDetail(
                    household_id=household_map.get(household_name),
                    bank_name=item.get("bankname") or "",
                    bank_type=item.get("banktypecheckingsavings") or "",
                    account_number=account_no,
                    beneficiary_1_name=item.get("beneficiary1name") or "",
                    beneficiary_1_percent=parse_float(item.get("beneficiary1")),
                    beneficiary_1_dob=parse_date(item.get("beneficiary1dob")),
                    beneficiary_2_name=item.get("beneficiary2name") or "",
                    beneficiary_2_percent=parse_float(item.get("beneficiary2")),
                    beneficiary_2_dob=parse_date(item.get("beneficiary2dob")),
                )
                db.add(bank_detail)
                db.flush()
                bank_map[account_no] = bank_detail.id

        unique_key = f"{household_name}_{item.get('accounttype')}_{account_no}"
        financial_profile = FinancialProfile(
            household_id=household_map.get(household_name),
            account_type=item.get("accounttype") or "",
            custodian=item.get("custodian") or "",
            client_tax_bracket=item.get("clienttaxbracket") or "",
            estimated_liquid_net_worth=parse_float(item.get("estimatedliquidnetworth")),
            estimated_total_net_worth=parse_float(item.get("estimatedtotalnetworth")),
            annual_income=parse_float(item.get("annualincome")),
            years_experience_bonds=parse_int(item.get("yearsofexperiencebonds")),
            years_experience_stocks=parse_int(item.get("yearsofexperiencestocks")),
            years_experience_alternatives=parse_int(
                item.get("yearsofexperiencealternatives")
            ),
            years_experience_vas=parse_int(item.get("yearsofexperiencevas")),
            years_experience_mutual_funds=parse_int(
                item.get("yearsofexperiencemutualfunds")
            ),
            years_experience_options=parse_int(item.get("yearsofexperienceoptions")),
            years_experience_partnerships=parse_int(
                item.get("yearsofexperiencepartnerships")
            ),
            primary_investment_objective=item.get("primaryinvestmentobjective") or "",
            risk_tolerance=item.get("risktolerance") or "",
            time_horizon=item.get("timehorizon") or "",
            account_decision_making=item.get("accountdecisionmaking") or "",
            source_of_funds=item.get("sourceoffunds") or "",
            primary_use_of_funds=item.get("primaryuseoffunds") or "",
            liquidity_needs=item.get("liquidityneeds") or "",
            liquidity_time_horizon=item.get("liquiditytimehorizon") or "",
        )
        db.add(financial_profile)

    db.commit()

    return {
        "message": "Excel file processed successfully.",
        "households": len(set(household_map.values())),
        "members": len(set(member_map.values())),
        "bank_details": len(set(bank_map.values())),
    }


def list_households(db: Session):
    households = db.query(Household).all()
    return [
        {
            "id": h.id,
            "name": h.name,
            "members_count": len(h.members) if h.members else 0,
            "accounts_count": len(h.financial_profiles) if h.financial_profiles else 0,
            "created_at": h.created_at.isoformat() if h.created_at else None,
            "updated_at": h.updated_at.isoformat() if h.updated_at else None,
        }
        for h in households
    ]


def get_household_by_id(db: Session, id: int):
    household = db.query(Household).filter(Household.id == id).first()
    if not household:
        return None

    return {
        "id": household.id,
        "name": household.name,
        "created_at": household.created_at.isoformat()
        if household.created_at
        else None,
        "updated_at": household.updated_at.isoformat()
        if household.updated_at
        else None,
        "members": [
            {
                "id": m.id,
                "first_name": m.first_name,
                "last_name": m.last_name,
                "date_of_birth": m.date_of_birth.isoformat()
                if m.date_of_birth
                else None,
                "ssn": m.ssn,
                "phone": m.phone,
                "email": m.email,
                "address": m.address,
                "occupation": m.occupation,
                "employer": m.employer,
                "marital_status": m.marital_status,
                "drivers_license_number": m.drivers_license_number,
                "drivers_license_state": m.drivers_license_state,
                "drivers_license_issue_date": m.drivers_license_issue_date.isoformat()
                if m.drivers_license_issue_date
                else None,
                "drivers_license_expiration_date": m.drivers_license_expiration_date.isoformat()
                if m.drivers_license_expiration_date
                else None,
            }
            for m in (household.members or [])
        ],
        "financial_profiles": [
            {
                "id": f.id,
                "account_type": f.account_type,
                "custodian": f.custodian,
                "client_tax_bracket": f.client_tax_bracket,
                "estimated_liquid_net_worth": f.estimated_liquid_net_worth,
                "estimated_total_net_worth": f.estimated_total_net_worth,
                "annual_income": f.annual_income,
                "years_experience_bonds": f.years_experience_bonds,
                "years_experience_stocks": f.years_experience_stocks,
                "years_experience_alternatives": f.years_experience_alternatives,
                "years_experience_vas": f.years_experience_vas,
                "years_experience_mutual_funds": f.years_experience_mutual_funds,
                "years_experience_options": f.years_experience_options,
                "years_experience_partnerships": f.years_experience_partnerships,
                "primary_investment_objective": f.primary_investment_objective,
                "risk_tolerance": f.risk_tolerance,
                "time_horizon": f.time_horizon,
                "account_decision_making": f.account_decision_making,
                "source_of_funds": f.source_of_funds,
                "primary_use_of_funds": f.primary_use_of_funds,
                "liquidity_needs": f.liquidity_needs,
                "liquidity_time_horizon": f.liquidity_time_horizon,
            }
            for f in (household.financial_profiles or [])
        ],
        "bank_details": [
            {
                "id": b.id,
                "bank_name": b.bank_name,
                "bank_type": b.bank_type,
                "account_number": b.account_number,
                "beneficiary_1_name": b.beneficiary_1_name,
                "beneficiary_1_percent": b.beneficiary_1_percent,
                "beneficiary_1_dob": b.beneficiary_1_dob.isoformat()
                if b.beneficiary_1_dob
                else None,
                "beneficiary_2_name": b.beneficiary_2_name,
                "beneficiary_2_percent": b.beneficiary_2_percent,
                "beneficiary_2_dob": b.beneficiary_2_dob.isoformat()
                if b.beneficiary_2_dob
                else None,
            }
            for b in (household.bank_details or [])
        ],
    }


def get_insights(db: Session):
    from sqlalchemy import func

    households = db.query(Household).all()
    members = db.query(HouseholdMember).all()
    financial_profiles = db.query(FinancialProfile).all()
    bank_details = db.query(BankDetail).all()

    total_households = len(households)
    total_members = len(members)
    total_accounts = len(financial_profiles)
    total_bank_accounts = len(bank_details)

    total_liquid_net_worth = sum(
        f.estimated_liquid_net_worth or 0 for f in financial_profiles
    )
    total_net_worth = sum(f.estimated_total_net_worth or 0 for f in financial_profiles)
    total_annual_income = sum(f.annual_income or 0 for f in financial_profiles)

    account_type_counts = {}
    for f in financial_profiles:
        acc_type = f.account_type or "Unknown"
        account_type_counts[acc_type] = account_type_counts.get(acc_type, 0) + 1

    custodian_counts = {}
    for f in financial_profiles:
        custodian = f.custodian or "Unknown"
        custodian_counts[custodian] = custodian_counts.get(custodian, 0) + 1

    risk_tolerance_counts = {}
    for f in financial_profiles:
        risk = f.risk_tolerance or "Unknown"
        risk_tolerance_counts[risk] = risk_tolerance_counts.get(risk, 0) + 1

    investment_objective_counts = {}
    for f in financial_profiles:
        obj = f.primary_investment_objective or "Unknown"
        investment_objective_counts[obj] = investment_objective_counts.get(obj, 0) + 1

    members_per_household = {}
    for h in households:
        members_per_household[h.name] = len(
            [m for m in members if m.household_id == h.id]
        )

    accounts_per_household = {}
    for h in households:
        accounts_per_household[h.name] = len(
            [f for f in financial_profiles if f.household_id == h.id]
        )

    account_values = [
        f.estimated_total_net_worth or 0
        for f in financial_profiles
        if f.estimated_total_net_worth
    ]

    top_households_by_net_worth = []
    for h in households:
        net_worth = sum(
            f.estimated_total_net_worth or 0
            for f in financial_profiles
            if f.household_id == h.id
        )
        if net_worth > 0:
            top_households_by_net_worth.append({"name": h.name, "net_worth": net_worth})
    top_households_by_net_worth.sort(key=lambda x: x["net_worth"], reverse=True)
    top_households_by_net_worth = top_households_by_net_worth[:10]

    net_worth_breakdown = {
        "liquid": total_liquid_net_worth,
        "illiquid": total_net_worth - total_liquid_net_worth
        if total_net_worth > total_liquid_net_worth
        else 0,
    }

    household_details = []
    for h in households:
        income = sum(
            f.annual_income or 0 for f in financial_profiles if f.household_id == h.id
        )
        net_worth = sum(
            f.estimated_total_net_worth or 0
            for f in financial_profiles
            if f.household_id == h.id
        )
        members_count = len([m for m in members if m.household_id == h.id])
        accounts_count = len([f for f in financial_profiles if f.household_id == h.id])

        household_details.append(
            {
                "name": h.name,
                "income": income,
                "net_worth": net_worth,
                "members": members_count,
                "accounts": accounts_count,
            }
        )

    return {
        "summary": {
            "total_households": total_households,
            "total_members": total_members,
            "total_accounts": total_accounts,
            "total_bank_accounts": total_bank_accounts,
            "total_liquid_net_worth": total_liquid_net_worth,
            "total_net_worth": total_net_worth,
            "total_annual_income": total_annual_income,
            "avg_net_worth_per_household": total_net_worth / total_households
            if total_households > 0
            else 0,
            "avg_income_per_household": total_annual_income / total_households
            if total_households > 0
            else 0,
        },
        "account_types": account_type_counts,
        "custodians": custodian_counts,
        "risk_tolerance": risk_tolerance_counts,
        "investment_objectives": investment_objective_counts,
        "members_per_household": members_per_household,
        "accounts_per_household": accounts_per_household,
        "account_values_distribution": account_values,
        "top_households_by_net_worth": top_households_by_net_worth,
        "net_worth_breakdown": net_worth_breakdown,
        "household_details": household_details,
    }
